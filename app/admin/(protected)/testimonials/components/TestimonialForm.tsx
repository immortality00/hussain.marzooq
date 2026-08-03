import Image from "next/image";
import { AdminProcessingPill } from "@/components/admin/action-feedback/AdminActionFeedback";
import {
  type TestimonialItem,
  identityLine,
  formatDate,
  renderStars,
  Avatar,
  StatusPill,
} from "./TestimonialShared";

function ReviewPhotos({ item }: { item: TestimonialItem }) {
  if (item.photoUrls.length === 0) {
    return (
      <div className="rounded-[1.4rem] border border-dashed border-border/70 p-5 text-sm text-muted-foreground">
        No extra photos attached to this review.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {item.photoUrls.map((url, index) => (
        <div
          key={url}
          className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem] bg-muted/50"
        >
          <Image
            src={url}
            alt={`${item.name} submitted photo ${index + 1}`}
            fill
            className="object-cover"
            sizes="260px"
          />
        </div>
      ))}
    </div>
  );
}

export function TestimonialInspectModal({
  item,
  updating,
  deleting,
  onSetApproval,
  onDelete,
  onClose,
}: {
  item: TestimonialItem;
  updating: boolean;
  deleting: boolean;
  onSetApproval: (id: string, value: boolean) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const metaLine = identityLine(item);
  const actionBusy = updating || deleting;

  return (
    <div className="fixed inset-0 z-50 bg-black/72 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto mt-6 w-full max-w-6xl overflow-hidden rounded-[2rem] bg-background shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">{item.name}</h2>
              {actionBusy ? (
                <AdminProcessingPill text={deleting ? "Deleting" : "Processing"} />
              ) : null}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Submitted {formatDate(item.createdAt)}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {item.isApproved ? (
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => onSetApproval(item.id, false)}
                className="rounded-xl border border-amber-500/30 px-4 py-2 text-sm text-amber-700 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:text-amber-300"
              >
                {updating ? "Unapproving…" : "Unapprove"}
              </button>
            ) : (
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => onSetApproval(item.id, true)}
                className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating ? "Approving…" : "Approve"}
              </button>
            )}
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => onDelete(item.id)}
              className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-600 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={actionBusy}
              className="rounded-xl border border-border/60 px-4 py-2 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[82vh] overflow-y-auto p-5 sm:p-6" data-lenis-prevent>
          <div className="grid gap-6 lg:grid-cols-[0.84fr_1.16fr]">
            <div className="space-y-5">
              <section className="rounded-[1.6rem] border border-border/60 p-5">
                <div className="flex items-start gap-4">
                  <Avatar name={item.name} profilePhotoUrl={item.profilePhotoUrl} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold tracking-[-0.02em]">{item.name}</div>
                      <StatusPill approved={item.isApproved} />
                    </div>
                    {metaLine ? (
                      <div className="mt-1 text-sm text-muted-foreground">{metaLine}</div>
                    ) : null}
                    <div className="mt-1 text-sm text-muted-foreground">
                      {item.email ?? "No email"}
                    </div>
                    <div className="mt-3 text-xl text-amber-400">{renderStars(item.rating)}</div>
                  </div>
                </div>
              </section>

              <section className="rounded-[1.6rem] border border-border/60 p-5">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="text-right">{formatDate(item.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Updated</dt>
                    <dd className="text-right">{formatDate(item.updatedAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Attached photos</dt>
                    <dd>{item.photoUrls.length}</dd>
                  </div>
                </dl>
              </section>
            </div>

            <div className="space-y-5">
              <section className="rounded-[1.6rem] border border-border/60 bg-muted/20 p-5">
                <blockquote className="whitespace-pre-wrap text-2xl leading-10 tracking-[-0.04em] text-foreground">
                  &quot;{item.review}&quot;
                </blockquote>
              </section>
              <section>
                <ReviewPhotos item={item} />
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
