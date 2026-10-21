import type { CSSProperties } from "react";
import SmartImage from "@/components/shared/SmartImage";
import { SocialDock } from "@/components/site/SocialDock";
import { SOCIAL_ICON_PATHS } from "@/components/site/social-icons";
import type { SocialItem } from "@/lib/social-links";

// Rendered on the server, so the icon artwork never reaches the browser bundle.
export function SocialLinks({ items }: { items: SocialItem[] }) {
  if (items.length === 0) return null;

  return (
    <SocialDock>
      {items.map((item, index) => (
        <li key={item.href} className="hm-float" style={{ "--float-index": index } as CSSProperties}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            data-no-transition
            aria-label={item.label}
            className="hm-social-link flex size-8 items-center justify-center md:size-9 rounded-full text-muted-foreground hover:text-foreground"
          >
            {"network" in item ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px] fill-current">
                <path d={SOCIAL_ICON_PATHS[item.network]} />
              </svg>
            ) : (
              <SmartImage src={item.logo} alt="" width={18} height={18} className="size-[18px]" />
            )}
          </a>
        </li>
      ))}
    </SocialDock>
  );
}
