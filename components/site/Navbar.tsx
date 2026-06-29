"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { WorkOverlay } from "@/components/site/WorkOverlay";

export function Navbar() {
  const [hiddenByModal, setHiddenByModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
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

  function openWork() {
    setMobileOpen(false);
    setWorkOpen(true);
  }

  return (
    <>
      <header
        className={[
          "sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all duration-300",
          isVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0",
        ].join(" ")}
      >
        <div className="section-shell">
          <div className="flex h-14 items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="group flex shrink-0 items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-[10px] tracking-[0.15em] text-muted-foreground transition-colors group-hover:border-foreground/40 group-hover:text-foreground">
                HM
              </span>
              <span className="hidden text-[13px] font-semibold tracking-[0.12em] text-foreground/80 transition-colors group-hover:text-foreground sm:inline">
                HM VISUALS
              </span>
            </Link>

            {/* Right side — nav + cta */}
            <div className="flex items-center gap-1">
              {/* Desktop nav items — right-aligned beside Book */}
              <nav className="hidden items-center md:flex">
                <button
                  type="button"
                  onClick={openWork}
                  className="group relative px-4 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Work
                  <span className="absolute inset-x-4 bottom-1 h-px scale-x-0 bg-foreground transition-transform duration-300 group-hover:scale-x-100" />
                </button>
                <NavLink href="/about">About</NavLink>
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
                href="/contact"
                className="hidden rounded-full border border-border/60 px-5 py-1.5 text-[13px] tracking-wide transition-all hover:border-foreground/40 hover:bg-accent md:inline-flex ml-2"
              >
                Book
              </Link>

              {/* Hamburger — mobile only */}
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((p) => !p)}
                className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] md:hidden"
              >
                <span className={`block h-px w-5 bg-foreground transition-all duration-300 ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`} />
                <span className={`block h-px w-5 bg-foreground transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`block h-px w-5 bg-foreground transition-all duration-300 ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={[
          "fixed inset-y-0 right-0 z-50 flex w-60 flex-col border-l border-border/50 bg-background/95 backdrop-blur-xl transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        aria-label="Mobile navigation"
      >
        <div className="flex h-14 items-center justify-between border-b border-border/50 px-5">
          <span className="text-[12px] font-semibold tracking-[0.12em] text-foreground/70">HM VISUALS</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="text-[18px] leading-none text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
          <button
            type="button"
            onClick={openWork}
            className="rounded-lg px-3 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          >
            Work
          </button>
          <Link
            href="/about"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          >
            About
          </Link>
        </nav>

        <div className="border-t border-border/50 px-5 py-5">
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="block rounded-full border border-border/60 px-4 py-2.5 text-center text-sm transition-colors hover:bg-accent"
          >
            Book a Session
          </Link>
        </div>
      </div>

      <WorkOverlay open={workOpen} onClose={() => setWorkOpen(false)} />
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={[
        "group relative px-4 py-2 text-[13px] transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {children}
      <span
        className={[
          "absolute inset-x-4 bottom-1 h-px bg-foreground transition-transform duration-300",
          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
        ].join(" ")}
      />
    </Link>
  );
}
