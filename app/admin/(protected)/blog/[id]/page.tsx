import { notFound } from "next/navigation";
import { BlogPostEditor } from "../components/BlogPostEditor";
import { loadCategoryOptions, loadPostForm } from "../lib/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [initial, categories] = await Promise.all([loadPostForm(id), loadCategoryOptions()]);

  if (!initial) notFound();

  return <BlogPostEditor id={id} initial={initial} categories={categories} />;
}
