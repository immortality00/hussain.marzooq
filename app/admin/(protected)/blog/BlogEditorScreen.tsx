"use client";

import { useSearchParams } from "next/navigation";
import { NoResults } from "@/components/shared/NoResults";
import { useAdminSlice } from "@/hooks/useAdminData";
import { BlogPostEditor } from "./components/BlogPostEditor";

export function BlogEditorScreen({ editing }: { editing: boolean }) {
  const id = (useSearchParams().get("id") ?? "").trim();
  const [blog] = useAdminSlice("blog");

  if (!editing) return <BlogPostEditor categories={blog.categoryOptions} />;

  const form = blog.forms[id];
  if (!form) return <NoResults>Post not found.</NoResults>;
  const version = blog.posts.find((post) => post.id === id)?.updatedAt ?? null;
  return <BlogPostEditor key={id} id={id} initial={form} version={version} categories={blog.categoryOptions} />;
}
