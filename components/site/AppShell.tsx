"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Navbar } from "@/components/site/Navbar";
import { Preloader } from "@/components/site/Preloader";
import { CustomCursor } from "@/components/site/CustomCursor";

gsap.registerPlugin(ScrollTrigger);

export function AppShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;
    const lenis = new Lenis();
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
    };
  }, [isAdmin]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="page-shell min-h-screen">
      {pathname === "/" && <Preloader />}
      <div className="grain-overlay" />
      <CustomCursor />
      <Navbar />
      <div className="relative z-10">{children}</div>
      {footer && <div className="relative z-10">{footer}</div>}
    </div>
  );
}