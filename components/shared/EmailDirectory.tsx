import { SITE_EMAILS } from "@/lib/site-emails";
import { cn } from "@/lib/utils";

/** The site's public addresses, each under what it is for. `className` lays out the list. */
export function EmailDirectory({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-4", className)}>
      {SITE_EMAILS.map(({ key, label, address }) => (
        <li key={key} className="flex min-w-0 flex-col gap-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <a
            href={`mailto:${address}`}
            className="self-start text-sm text-foreground/85 wrap-anywhere transition-colors hover:text-foreground"
          >
            {address}
          </a>
        </li>
      ))}
    </ul>
  );
}
