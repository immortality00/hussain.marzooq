import type { CSSProperties } from "react";
import { SocialDock } from "@/components/site/SocialDock";
import { SocialIconLink } from "@/components/site/SocialIconLink";
import type { SocialItem } from "@/lib/social-links";

// The floating column. Rendered on the server, so the icon artwork never reaches the browser bundle.
export function SocialLinks({ items }: { items: SocialItem[] }) {
  if (items.length === 0) return null;

  return (
    <SocialDock>
      {items.map((item, index) => (
        <li key={item.href} className="hm-float" style={{ "--float-index": index } as CSSProperties}>
          <SocialIconLink item={item} className="hm-social-link size-8 md:size-9" />
        </li>
      ))}
    </SocialDock>
  );
}

// The same links in the footer: a plain row, no float. On a phone it sits under the emails,
// on a wide screen under the footer's opening lines (SiteFooter places it).
export function FooterSocialLinks({ items, className }: { items: SocialItem[]; className?: string }) {
  if (items.length === 0) return null;

  return (
    <ul aria-label="Social links" className={className}>
      {items.map((item) => (
        <li key={item.href}>
          <SocialIconLink
            item={item}
            className="size-9 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          />
        </li>
      ))}
    </ul>
  );
}
