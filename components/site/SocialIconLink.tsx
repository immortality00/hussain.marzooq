import SmartImage from "@/components/shared/SmartImage";
import { SOCIAL_ICON_PATHS } from "@/components/site/social-icons";
import type { SocialItem } from "@/lib/social-links";
import { cn } from "@/lib/utils";

// One profile link as its icon: the network's mark, or the site's own fetched logo. Used by
// the floating column and the footer. Server only, so the icon artwork never reaches the
// browser bundle. `className` sizes the tap area.
export function SocialIconLink({ item, className }: { item: SocialItem; className?: string }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      data-no-transition
      aria-label={item.label}
      className={cn(
        "flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {"network" in item ? (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px] fill-current">
          <path d={SOCIAL_ICON_PATHS[item.network]} />
        </svg>
      ) : (
        <SmartImage src={item.logo} alt="" width={18} height={18} className="size-[18px]" />
      )}
    </a>
  );
}
