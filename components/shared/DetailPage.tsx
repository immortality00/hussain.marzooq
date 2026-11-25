import { BackButton } from "@/components/shared/BackButton";
import { TitleBarFrame } from "@/components/shared/title-bar/TitleBarFrame";
import type { TitleBarInfo } from "@/components/shared/title-bar/TitleBar";
import { cn } from "@/lib/utils";

// The frame of every page reached from a listing (a person, a tag, a service, a blog post):
// the Back button at the top-left of the content, the same distance from the navbar and
// from what follows on every one of them. `className` carries the page's bottom padding.
// With `bar` (a person, a tag page), Back and the title move into a title bar under the navbar
// once the page scrolls (components/shared/title-bar/).
export function DetailPage({
  backHref,
  className,
  bar,
  children,
}: {
  backHref: string;
  className?: string;
  bar?: TitleBarInfo;
  children: React.ReactNode;
}) {
  const page = (
    <main className={cn("section-shell pt-12 sm:pt-16", className)}>
      <BackButton fallbackHref={backHref} part={bar ? "page" : undefined} />
      <div className="mt-6">{children}</div>
    </main>
  );
  if (!bar) return page;

  return (
    <TitleBarFrame {...bar} backHref={backHref}>
      {page}
    </TitleBarFrame>
  );
}
