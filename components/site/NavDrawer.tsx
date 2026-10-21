"use client";

import Link from "next/link";
import type { NavItem } from "@/components/site/nav-items";

const DRAWER_LINK =
  "rounded-xl px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground";

export function NavDrawer({
  open,
  items,
  onClose,
}: {
  open: boolean;
  items: NavItem[];
  onClose: () => void;
}) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <div
        className={[
          "fixed inset-y-0 right-0 z-50 flex w-60 flex-col border-l border-border/50 bg-background/95 backdrop-blur-xl transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        aria-label="Mobile navigation"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-5">
          <span role="img" aria-label="Hussain.Art" className="hm-wordmark h-8 text-foreground/70" />
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="text-[18px] leading-none text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <nav data-lenis-prevent className="flex flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-3 py-4">
          {items.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose} className={DRAWER_LINK}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="shrink-0 border-t border-border/50 px-5 py-5">
          <Link
            href="/contact"
            onClick={onClose}
            className="block rounded-full border border-border/60 px-4 py-2.5 text-center text-sm transition-colors hover:bg-accent"
          >
            Book a Session
          </Link>
        </div>
      </div>
    </>
  );
}
