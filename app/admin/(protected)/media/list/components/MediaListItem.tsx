import Image from "next/image";
import type { AdminMediaListItem } from "@/lib/server/media-serializers";
import { AdminLink } from "@/components/admin/AdminLink";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { formatPublishAt, isScheduled } from "@/lib/media-schedule";
import { NftDetails, NftStatusChip } from "./MediaListNft";
import { MediaListPeople } from "./MediaListPeople";

export type MediaItem = AdminMediaListItem;

export function MediaListItem({
  item,
  index,
  deleting,
  actionDisabled,
  onDelete,
}: {
  item: MediaItem;
  index: number;
  deleting: boolean;
  actionDisabled: boolean;
  onDelete: (id: string) => void;
}) {
  const stillSrc = item.type === "embed" ? item.posterUrl : item.secureUrl;

  return (
    <div className="rounded-2xl border p-5">
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="overflow-hidden rounded-2xl border bg-muted">
          {item.type === "video" && item.secureUrl ? (
            <video className="h-full w-full" controls preload="metadata" src={item.secureUrl} />
          ) : stillSrc ? (
            <div className="relative aspect-4/3">
              <Image
                src={stillSrc}
                alt={item.title}
                fill
                className="object-cover"
                sizes="240px"
                preload={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          ) : (
            <div className="flex h-45 items-center justify-center text-xs text-muted-foreground">
              No preview
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="min-w-0 text-lg font-semibold wrap-anywhere">{item.title}</div>
                {deleting ? (
                  <span className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
                    Processing
                  </span>
                ) : null}
                {isScheduled(item.publishAt) ? (
                  <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
                    Scheduled · {formatPublishAt(item.publishAt)}
                  </span>
                ) : null}
              </div>
              <div className="mt-1 text-xs text-muted-foreground wrap-anywhere">
                {item.type} • {item.isPublic ? "Public" : "Private"}
                {item.year ? ` • ${item.year}` : ""}
                {item.location ? ` • ${item.location}` : ""}
                {item.event ? ` • ${item.event}` : ""}
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <AdminLink
                href={`/admin/media?edit=${encodeURIComponent(item.id)}`}
                aria-disabled={actionDisabled}
                tabIndex={actionDisabled ? -1 : undefined}
                className={adminButtonClasses("default", "md", actionDisabled ? "pointer-events-none opacity-60" : undefined)}
              >
                Edit
              </AdminLink>
              <button
                type="button"
                disabled={actionDisabled}
                onClick={() => onDelete(item.id)}
                className={adminButtonClasses("danger", "md")}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {item.categories.slice(0, 10).map((c) => (
              <span key={`${item.id}-${c}`} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                {c}
              </span>
            ))}
            {item.nft ? <NftStatusChip nft={item.nft} /> : null}
          </div>

          {item.nft ? <NftDetails nft={item.nft} /> : null}

          <MediaListPeople ids={item.peopleIds} names={item.people} />

          {item.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.slice(0, 14).map((t) => (
                <span key={`${item.id}-${t}`} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-3 font-mono text-xs text-muted-foreground wrap-anywhere">ID: {item.id}</div>
        </div>
      </div>
    </div>
  );
}
