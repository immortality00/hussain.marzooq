import type { EmailListItem } from "@/lib/email-list";
import { cn } from "@/lib/utils";

/** The site's public addresses, each under what it is for. `className` lays out the list. */
export function EmailDirectory({ emails, className }: { emails: EmailListItem[]; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-4", className)}>
      {emails.map(({ label, address }) => (
        <li key={address} className="flex min-w-0 flex-col gap-1">
          {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
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
