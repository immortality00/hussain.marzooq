"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Navbar } from "@/components/site/Navbar";
import { Preloader } from "@/components/site/Preloader";
import { CustomCursor } from "@/components/site/CustomCursor";
import { SiteAnalytics } from "@/components/site/Analytics";
import { TransitionProvider } from "@/components/transitions/TransitionContext";

gsap.registerPlugin(ScrollTrigger);

export function AppShell({
  children,
  footer,
  transitionImages,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  transitionImages?: string[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;
    const lenis = new Lenis();
    (window as unknown as { lenis?: Lenis }).lenis = lenis;
    // Keep GSAP ScrollTrigger in sync with Lenis's smoothed scroll position,
    // otherwise pinned/scrubbed sections (e.g. photography horizontal mode) drift.
    lenis.on("scroll", ScrollTrigger.update);
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      (window as unknown as { lenis?: Lenis }).lenis = undefined;
    };
  }, [isAdmin]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="page-shell min-h-screen">
      <a
        href="#main-content"
        data-no-transition
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:inline-flex focus:items-center focus:rounded-full focus:border focus:border-foreground/30 focus:bg-background focus:px-5 focus:py-[0.6875rem] focus:text-sm focus:leading-none focus:text-foreground focus:outline-2 focus:outline-offset-3 focus:outline-foreground"
      >
        Skip to content
      </a>
      {pathname === "/" && <Preloader />}
      <div className="grain-overlay" />
      <CustomCursor />
      <SiteAnalytics />
      <Navbar />
      <TransitionProvider images={transitionImages}>
        <div id="main-content" tabIndex={-1} className="relative z-10">
          {children}
        </div>
        {footer && <div className="relative z-10">{footer}</div>}
      </TransitionProvider>
    </div>
  );
}