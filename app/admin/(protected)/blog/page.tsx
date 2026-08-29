import BlogAdminClient from "./BlogAdminClient";
import { loadBlogList } from "./lib/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminBlogPage() {
  const initial = await loadBlogList();
  return <BlogAdminClient initial={initial} />;
}
