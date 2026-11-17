import { BackButton } from "@/components/shared/BackButton";
import { cn } from "@/lib/utils";

// The frame of every page reached from a listing (a person, a tag, a service, a blog post):
// the Back button at the top-left of the content, the same distance from the navbar and
// from what follows on every one of them. `className` carries the page's bottom padding.
export function DetailPage({
  backHref,
  className,
  children,
}: {
  backHref: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <main className={cn("section-shell pt-12 sm:pt-16", className)}>
      <BackButton fallbackHref={backHref} />
      <div className="mt-6">{children}</div>
    </main>
  );
}
