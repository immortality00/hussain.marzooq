import SmartImage from "@/components/shared/SmartImage";
import { BackButton } from "@/components/shared/BackButton";
import { buttonClasses } from "@/components/shared/Button";

/** What a page shows in its title bar: its title and, for a person, their photo (null: none). */
export type TitleBarInfo = { title: string; avatarUrl?: string | null };

// The bar under the navbar on a scrolled page: the title centred; on a detail page, Back on the
// left (an unseen copy of it on the right keeps the middle truly centred) and, for a person, the
// photo beside the name. A long title ends in "…" here only — it is in full at the top of the
// page. The photo asks for the page photo's own size, so it is the file already downloaded. The
// title repeats the page's own heading, which stays in place for a screen reader, so the middle
// is aria-hidden.
export function TitleBar({ title, avatarUrl, backHref }: TitleBarInfo & { backHref?: string }) {
  return (
    <div className="hm-title-bar">
      <div className="hm-title-bar-row section-shell">
        <div className="justify-self-start">
          {backHref ? <BackButton fallbackHref={backHref} part="bar" /> : null}
        </div>
        <div aria-hidden className="flex min-w-0 items-center gap-2.5">
          {avatarUrl === undefined ? null : (
            <span
              data-title-bar-avatar=""
              className="relative size-8 shrink-0 overflow-hidden rounded-full border bg-muted"
            >
              {avatarUrl ? (
                <SmartImage src={avatarUrl} alt="" fill sizes="144px" className="object-cover" />
              ) : null}
            </span>
          )}
          <p data-title-bar-heading="" className="min-w-0 truncate text-base font-semibold tracking-tight">
            {title}
          </p>
        </div>
        {backHref ? (
          <span aria-hidden className={buttonClasses("ghost", "invisible justify-self-end")}>
            Back
          </span>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
