import { describe, expect, it } from "vitest";
import { ADMIN_HOME_PATH, adminSignInPath, safeAdminNextPath } from "@/lib/auth/admin-next-path";

describe("safeAdminNextPath", () => {
  it("keeps an admin page and its query", () => {
    expect(safeAdminNextPath("/admin/inquiries")).toBe("/admin/inquiries");
    expect(safeAdminNextPath("/admin/media/list?category=nft")).toBe("/admin/media/list?category=nft");
  });

  it("sends anything empty, external or outside admin to the dashboard", () => {
    for (const value of [null, undefined, "", "admin/inquiries", "//evil.com/admin/x", "https://evil.com/admin/x", "/", "/about", "/adminx"]) {
      expect(safeAdminNextPath(value)).toBe(ADMIN_HOME_PATH);
    }
  });

  it("never returns the sign-in page or logout, so a signed-in visitor cannot loop", () => {
    for (const value of [
      "/admin",
      "/admin/",
      "/admin?next=/admin",
      "/admin/sign-in",
      "/admin/sign-in/?next=/admin/sign-in",
      "/admin/login",
      "/admin/logout",
      "/admin/logout/",
    ]) {
      expect(safeAdminNextPath(value)).toBe(ADMIN_HOME_PATH);
    }
  });

  it("normalises dot segments before deciding", () => {
    expect(safeAdminNextPath("/admin/../about")).toBe(ADMIN_HOME_PATH);
    expect(safeAdminNextPath("/admin/pages/../inquiries")).toBe("/admin/inquiries");
  });

  it("builds the sign-in address that returns to the page asked for", () => {
    expect(adminSignInPath("/admin/media/list?category=nft")).toBe(
      "/admin/sign-in?next=%2Fadmin%2Fmedia%2Flist%3Fcategory%3Dnft"
    );
  });
});
