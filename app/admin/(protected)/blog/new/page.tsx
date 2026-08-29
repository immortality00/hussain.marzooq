import { BlogPostEditor } from "../components/BlogPostEditor";
import { loadCategoryOptions } from "../lib/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewBlogPostPage() {
  const categories = await loadCategoryOptions();
  return <BlogPostEditor categories={categories} />;
}
