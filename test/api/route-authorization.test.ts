import { afterEach, describe, expect, test, vi } from "vitest";

const { getDb } = vi.hoisted(() => ({
  getDb: vi.fn(async () => {
    throw new Error("A route reached the database before authorizing the request.");
  }),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
}));

// Any handler that queries before it authorizes fails loudly here rather than
// quietly passing on a 401 it happened to return later.
vi.mock("@/lib/server/db", () => ({ getDb }));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}));

type Handler = (req: Request, ctx: unknown) => Promise<Response>;
type Route = {
  name: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  params?: Record<string, string>;
  load: () => Promise<Record<string, unknown>>;
};

const OID = "507f1f77bcf86cd799439011";

const routes: Route[] = [
  {
    name: "PATCH /api/admin/page-sections/[slug]",
    method: "PATCH",
    path: "/api/admin/page-sections/about",
    params: { slug: "about" },
    load: () => import("@/app/api/admin/page-sections/[slug]/route"),
  },
  {
    name: "PATCH /api/admin/page-seo/[slug]",
    method: "PATCH",
    path: "/api/admin/page-seo/about",
    params: { slug: "about" },
    load: () => import("@/app/api/admin/page-seo/[slug]/route"),
  },
  {
    name: "PATCH /api/admin/page-settings/[slug]",
    method: "PATCH",
    path: "/api/admin/page-settings/photography",
    params: { slug: "photography" },
    load: () => import("@/app/api/admin/page-settings/[slug]/route"),
  },
  {
    name: "GET /api/blog",
    method: "GET",
    path: "/api/blog",
    load: () => import("@/app/api/blog/route"),
  },
  {
    name: "POST /api/blog",
    method: "POST",
    path: "/api/blog",
    load: () => import("@/app/api/blog/route"),
  },
  {
    name: "PATCH /api/blog/[id]",
    method: "PATCH",
    path: `/api/blog/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/blog/[id]/route"),
  },
  {
    name: "DELETE /api/blog/[id]",
    method: "DELETE",
    path: `/api/blog/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/blog/[id]/route"),
  },
  {
    name: "GET /api/blog-categories",
    method: "GET",
    path: "/api/blog-categories",
    load: () => import("@/app/api/blog-categories/route"),
  },
  {
    name: "POST /api/blog-categories",
    method: "POST",
    path: "/api/blog-categories",
    load: () => import("@/app/api/blog-categories/route"),
  },
  {
    name: "PATCH /api/blog-categories/[id]",
    method: "PATCH",
    path: `/api/blog-categories/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/blog-categories/[id]/route"),
  },
  {
    name: "DELETE /api/blog-categories/[id]",
    method: "DELETE",
    path: `/api/blog-categories/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/blog-categories/[id]/route"),
  },
  {
    name: "GET /api/inquiries",
    method: "GET",
    path: "/api/inquiries",
    load: () => import("@/app/api/inquiries/route"),
  },
  {
    name: "PATCH /api/inquiries/[id]",
    method: "PATCH",
    path: `/api/inquiries/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/inquiries/[id]/route"),
  },
  {
    name: "DELETE /api/inquiries/[id]",
    method: "DELETE",
    path: `/api/inquiries/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/inquiries/[id]/route"),
  },
  {
    name: "POST /api/media-tags",
    method: "POST",
    path: "/api/media-tags",
    load: () => import("@/app/api/media-tags/route"),
  },
  {
    name: "GET /api/media-tags?scope=admin",
    method: "GET",
    path: "/api/media-tags?scope=admin",
    load: () => import("@/app/api/media-tags/route"),
  },
  {
    name: "PATCH /api/media-tags/[id]",
    method: "PATCH",
    path: `/api/media-tags/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/media-tags/[id]/route"),
  },
  {
    name: "DELETE /api/media-tags/[id]",
    method: "DELETE",
    path: `/api/media-tags/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/media-tags/[id]/route"),
  },
  {
    name: "GET /api/media/[id]",
    method: "GET",
    path: `/api/media/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/media/[id]/route"),
  },
  {
    name: "PATCH /api/media/[id]",
    method: "PATCH",
    path: `/api/media/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/media/[id]/route"),
  },
  {
    name: "DELETE /api/media/[id]",
    method: "DELETE",
    path: `/api/media/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/media/[id]/route"),
  },
  {
    name: "GET /api/media/admin-list",
    method: "GET",
    path: "/api/media/admin-list",
    load: () => import("@/app/api/media/admin-list/route"),
  },
  {
    name: "POST /api/media/create",
    method: "POST",
    path: "/api/media/create",
    load: () => import("@/app/api/media/create/route"),
  },
  {
    name: "GET /api/people",
    method: "GET",
    path: "/api/people",
    load: () => import("@/app/api/people/route"),
  },
  {
    name: "POST /api/people",
    method: "POST",
    path: "/api/people",
    load: () => import("@/app/api/people/route"),
  },
  {
    name: "GET /api/people/[id]",
    method: "GET",
    path: `/api/people/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/people/[id]/route"),
  },
  {
    name: "PATCH /api/people/[id]",
    method: "PATCH",
    path: `/api/people/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/people/[id]/route"),
  },
  {
    name: "DELETE /api/people/[id]",
    method: "DELETE",
    path: `/api/people/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/people/[id]/route"),
  },
  {
    name: "POST /api/people/[id]/removal",
    method: "POST",
    path: `/api/people/${OID}/removal`,
    params: { id: OID },
    load: () => import("@/app/api/people/[id]/removal/route"),
  },
  {
    name: "GET /api/private-galleries",
    method: "GET",
    path: "/api/private-galleries",
    load: () => import("@/app/api/private-galleries/route"),
  },
  {
    name: "POST /api/private-galleries",
    method: "POST",
    path: "/api/private-galleries",
    load: () => import("@/app/api/private-galleries/route"),
  },
  {
    name: "GET /api/private-galleries/[id]",
    method: "GET",
    path: `/api/private-galleries/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/private-galleries/[id]/route"),
  },
  {
    name: "PATCH /api/private-galleries/[id]",
    method: "PATCH",
    path: `/api/private-galleries/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/private-galleries/[id]/route"),
  },
  {
    name: "DELETE /api/private-galleries/[id]",
    method: "DELETE",
    path: `/api/private-galleries/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/private-galleries/[id]/route"),
  },
  {
    name: "GET /api/service-categories",
    method: "GET",
    path: "/api/service-categories",
    load: () => import("@/app/api/service-categories/route"),
  },
  {
    name: "POST /api/service-categories",
    method: "POST",
    path: "/api/service-categories",
    load: () => import("@/app/api/service-categories/route"),
  },
  {
    name: "PATCH /api/service-categories/[id]",
    method: "PATCH",
    path: `/api/service-categories/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/service-categories/[id]/route"),
  },
  {
    name: "DELETE /api/service-categories/[id]",
    method: "DELETE",
    path: `/api/service-categories/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/service-categories/[id]/route"),
  },
  {
    name: "POST /api/services",
    method: "POST",
    path: "/api/services",
    load: () => import("@/app/api/services/route"),
  },
  {
    name: "PATCH /api/services/[id]",
    method: "PATCH",
    path: `/api/services/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/services/[id]/route"),
  },
  {
    name: "DELETE /api/services/[id]",
    method: "DELETE",
    path: `/api/services/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/services/[id]/route"),
  },
  {
    name: "POST /api/services/recount-inquiries",
    method: "POST",
    path: "/api/services/recount-inquiries",
    load: () => import("@/app/api/services/recount-inquiries/route"),
  },
  {
    name: "POST /api/sign-cloudinary-params",
    method: "POST",
    path: "/api/sign-cloudinary-params",
    load: () => import("@/app/api/sign-cloudinary-params/route"),
  },
  {
    name: "POST /api/admin/uploads/cleanup",
    method: "POST",
    path: "/api/admin/uploads/cleanup",
    load: () => import("@/app/api/admin/uploads/cleanup/route"),
  },
  {
    name: "GET /api/testimonials",
    method: "GET",
    path: "/api/testimonials",
    load: () => import("@/app/api/testimonials/route"),
  },
  {
    name: "GET /api/testimonials/[id]",
    method: "GET",
    path: `/api/testimonials/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/testimonials/[id]/route"),
  },
  {
    name: "PATCH /api/testimonials/[id]",
    method: "PATCH",
    path: `/api/testimonials/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/testimonials/[id]/route"),
  },
  {
    name: "DELETE /api/testimonials/[id]",
    method: "DELETE",
    path: `/api/testimonials/${OID}`,
    params: { id: OID },
    load: () => import("@/app/api/testimonials/[id]/route"),
  },
];

afterEach(() => {
  vi.clearAllMocks();
});

describe("admin-guarded routes reject unauthenticated requests", () => {
  test("the table covers every admin handler under app/api", () => {
    expect(routes.length).toBeGreaterThanOrEqual(45);
  });

  test.each(routes.map((route) => [route.name, route] as const))(
    "401s %s",
    async (_name, route) => {
      const mod = await route.load();
      const handler = mod[route.method] as Handler | undefined;

      expect(handler, `${route.name} exports no ${route.method} handler`).toBeTypeOf("function");

      const req = new Request(`https://hm.test${route.path}`, {
        method: route.method,
        ...(route.method === "GET" || route.method === "DELETE"
          ? {}
          : { body: JSON.stringify({}), headers: { "content-type": "application/json" } }),
      });

      const res = await handler!(req, { params: Promise.resolve(route.params ?? {}) });

      expect(res.status, `${route.name} did not return 401`).toBe(401);
      expect(getDb, `${route.name} queried the database before authorizing`).not.toHaveBeenCalled();
    }
  );
});
