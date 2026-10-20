"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { NavDrawer } from "@/components/site/NavDrawer";
import { isActivePath, navItems } from "@/components/site/nav-items";
import type { DisciplineSlug } from "@/lib/disciplines";
import { useMagneticHover } from "@/hooks/useMagneticHover";
import { hasAdminHint } from "@/lib/client/admin-hint";

const ADMIN_HREF = "/admin/dashboard";

const NAV_PILL =
  "rounded-full border border-border/60 px-5 py-1.5 text-[13px] tracking-wide transition-[background-color,border-color] hover:border-foreground/40 hover:bg-accent";

const noopSubscribe = () => () => {};

export function Navbar({ activeDisciplines }: { activeDisciplines: DisciplineSlug[] }) {
  const [hiddenByModal, setHiddenByModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const bookRef = useMagneticHover<HTMLAnchorElement>();
  const isAdmin = useSyncExternalStore(noopSubscribe, hasAdminHint, () => false);
  const [mounted, setMounted] = useState(false);
  // next-themes hydration guard: the resolved theme is unknown during SSR, so we
  // render a stable placeholder until mounted. The one-shot setState on mount is the
  // documented pattern for this and is intentional.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  const themeIcon = mounted ? (
    resolvedTheme === "dark" ? <Sun size={14} /> : <Moon size={14} />
  ) : (
    <span className="inline-block h-[14px] w-[14px]" />
  );

  useEffect(() => {
    function onOpen() { setHiddenByModal(true); }
    function onClose() { setHiddenByModal(false); }
    window.addEventListener("hm_modal_open", onOpen);
    window.addEventListener("hm_modal_close", onClose);
    return () => {
      window.removeEventListener("hm_modal_open", onOpen);
      window.removeEventListener("hm_modal_close", onClose);
    };
  }, []);

  const isVisible = useMemo(
    () => !hiddenByModal || pathname === "/contact",
    [hiddenByModal, pathname],
  );
  const items = useMemo(() => navItems(activeDisciplines), [activeDisciplines]);

  return (
    <>
      <header
        className={[
          "sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300",
          isVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0",
        ].join(" ")}
      >
        <div className="flex h-12 items-center justify-between gap-4 px-4">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Hussain.Art — home"
            className="shell-inset-start flex shrink-0 items-center rounded-2xl text-foreground/80 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            <span className="hm-wordmark h-9 sm:h-12" />
          </Link>

          {/* Right side — nav + cta */}
          <div className="flex items-center gap-1">
            {/* Desktop nav items — right-aligned beside Book */}
            <nav className="hidden items-center lg:flex">
              {items.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
              {isAdmin ? (
                <NavLink href={ADMIN_HREF} prefetch={false}>
                  Admin
                </NavLink>
              ) : null}
            </nav>

            {/* Theme toggle */}
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="hidden h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:flex"
            >
              {themeIcon}
            </button>

            {/* Book CTA */}
            <Link
              ref={bookRef}
              href="/contact"
              data-magnetic=""
              className={`${NAV_PILL} hidden md:inline-flex ml-2`}
            >
              Book
            </Link>

            {isAdmin ? (
              <Link href={ADMIN_HREF} prefetch={false} className={`${NAV_PILL} mr-1 inline-flex lg:hidden`}>
                Admin
              </Link>
            ) : null}

            {/* Hamburger — below lg */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((p) => !p)}
              className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] lg:hidden"
            >
              <span className={`block h-px w-5 bg-foreground transition-[translate,rotate,opacity] duration-300 ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block h-px w-5 bg-foreground transition-[translate,rotate,opacity] duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-px w-5 bg-foreground transition-[translate,rotate,opacity] duration-300 ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <NavDrawer open={mobileOpen} items={items} onClose={() => setMobileOpen(false)} />
    </>
  );
}

function NavLink({
  href,
  prefetch,
  children,
}: {
  href: string;
  prefetch?: boolean;
  children: React.ReactNode;
}) {
  const isActive = isActivePath(usePathname(), href);
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={[
        "group relative whitespace-nowrap px-2.5 py-2 text-[13px] transition-colors xl:px-4",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {children}
      <span
        className={[
          "absolute inset-x-2.5 bottom-1 h-px bg-foreground transition-transform duration-300 xl:inset-x-4",
          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
        ].join(" ")}
      />
    </Link>
  );
}
