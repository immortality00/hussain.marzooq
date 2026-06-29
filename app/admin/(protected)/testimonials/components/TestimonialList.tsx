import { AdminProcessingPill } from "@/components/admin/action-feedback/AdminActionFeedback";
import {
  type TestimonialItem,
  identityLine,
  formatDate,
  renderStars,
  Avatar,
  StatusPill,
} from "./TestimonialShared";

export function ReviewRow({
  item,
  updating,
  deleting,
  onInspect,
  onSetApproval,
  onDelete,
}: {
  item: TestimonialItem;
  updating: boolean;
  deleting: boolean;
  onInspect: (item: TestimonialItem) => void;
  onSetApproval: (id: string, value: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const metaLine = identityLine(item);
  const actionBusy = updating || deleting;

  return (
    <article
      className={`rounded-[1.6rem] bg-background/78 p-4 ring-1 ring-border/45 transition-opacity ${
        actionBusy ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <button type="button" onClick={() => onInspect(item)} className="min-w-0 text-left">
          <div className="flex gap-4">
            <Avatar name={item.name} profilePhotoUrl={item.profilePhotoUrl} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-medium">{item.name}</div>
                <StatusPill approved={item.isApproved} />
                {actionBusy ? (
                  <AdminProcessingPill text={deleting ? "Deleting" : "Processing"} />
                ) : null}
              </div>
              {metaLine ? (
                <div className="mt-1 text-xs text-muted-foreground">{metaLine}</div>
              ) : null}
              <div className="mt-1 text-xs text-muted-foreground">{item.email || "No email"}</div>
              <div className="mt-2 text-sm text-amber-400">{renderStars(item.rating)}</div>
              <div className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {item.review}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>
                  {item.photoUrls.length} photo{item.photoUrls.length === 1 ? "" : "s"}
                </span>
                <span>·</span>
                <span>Submitted {formatDate(item.createdAt)}</span>
              </div>
            </div>
          </div>
        </button>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => onInspect(item)}
            disabled={actionBusy}
            className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            Inspect
          </button>
          {item.isApproved ? (
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => onSetApproval(item.id, false)}
              className="rounded-xl border border-amber-500/30 px-3 py-2 text-sm text-amber-700 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:text-amber-300"
            >
              {updating ? "Unapproving…" : "Unapprove"}
            </button>
          ) : (
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => onSetApproval(item.id, true)}
              className="rounded-xl bg-foreground px-3 py-2 text-sm text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updating ? "Approving…" : "Approve"}
            </button>
          )}
          <button
            type="button"
            disabled={actionBusy}
            onClick={() => onDelete(item.id)}
            className="rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}
