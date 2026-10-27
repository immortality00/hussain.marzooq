import { Tag } from "lucide-react";
import type { ReactNode } from "react";

export function MediaListTags({ tags, action }: { tags: string[]; action?: ReactNode }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Tag aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="sr-only">Tags:</span>
      {tags.length ? (
        tags.slice(0, 14).map((tag) => (
          <span key={tag} className="max-w-full rounded-full border px-2 py-0.5 text-xs text-muted-foreground wrap-anywhere">
            {tag}
          </span>
        ))
      ) : (
        <span className="text-xs text-muted-foreground">No tags</span>
      )}
      {action}
    </div>
  );
}
