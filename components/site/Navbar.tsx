"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/photography", label: "Photography" },
  { href: "/videography", label: "Videography" },
  { href: "/services", label: "Services" },
  { href: "/nft", label: "NFT" },
  { href: "/dancing", label: "Dancing" },
  { href: "/web-development", label: "Web Development" },
  { href: "/people", label: "People" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const [hiddenByModal, setHiddenByModal] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function onOpen() {
      setHiddenByModal(true);
    }

    function onClose() {
      setHiddenByModal(false);
    }

    window.addEventListener("hm_modal_open", onOpen);
    window.addEventListener("hm_modal_close", onClose);

    return () => {
      window.removeEventListener("hm_modal_open", onOpen);
      window.removeEventListener("hm_modal_close", onClose);
    };
  }, []);

  const isVisible = useMemo(() => {
    return !hiddenByModal || pathname === "/contact";
  }, [hiddenByModal, pathname]);

  const normalizedPath = useMemo(() => pathname.replace(/\/+$/, "") || "/", [pathname]);

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b bg-background/68 backdrop-blur-xl transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0",
      ].join(" ")}
    >
      <div className="section-shell">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border text-xs tracking-[0.18em] text-muted-foreground">
              HM
            </span>
            <span className="hidden text-sm font-semibold tracking-[0.14em] sm:inline">
              HM VISUALS
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 xl:flex">
            {nav.map((item) => {
              const isActive =
                item.href === "/"
                  ? normalizedPath === "/"
                  : normalizedPath === item.href || normalizedPath.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group relative whitespace-nowrap px-1.5 py-1.5 text-[12px] transition-colors 2xl:text-[13px]",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {item.label}
                  <span
                    className={[
                      "absolute inset-x-0 -bottom-[1px] mx-auto h-px w-0 bg-foreground transition-all duration-300",
                      isActive ? "w-full" : "group-hover:w-full",
                    ].join(" ")}
                  />
                </Link>
              );
            })}
          </nav>

          <Link
            href="/contact"
            className="shrink-0 rounded-full border px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            Book
          </Link>
        </div>
      </div>
    </header>
  );
}