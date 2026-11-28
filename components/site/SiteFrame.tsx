"use client";

import { usePathname } from "next/navigation";
import { TransitionProvider } from "@/components/transitions/TransitionContext";
import { Navbar } from "@/components/site/Navbar";
import { ScrollMemory } from "@/components/site/ScrollMemory";
import { BackToTop } from "@/components/site/BackToTop";
import { SitePullToRefresh } from "@/components/site/SitePullToRefresh";
import type { DisciplineSlug } from "@/lib/disciplines";

export function SiteFrame({
  children,
  footer,
  social,
  transitionImages,
  activeDisciplines,
  fullPageLoads,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  social: React.ReactNode;
  transitionImages: string[];
  activeDisciplines: DisciplineSlug[];
  fullPageLoads?: boolean;
}) {
  if (usePathname().startsWith("/admin")) return <>{children}</>;

  return (
    <TransitionProvider images={transitionImages} fullPageLoads={fullPageLoads}>
      <SitePullToRefresh fullPageLoads={fullPageLoads} />
      <Navbar activeDisciplines={activeDisciplines} />
      <div data-pull-moves className="relative z-10">
        <div id="main-content" tabIndex={-1} className="relative">
          {children}
        </div>
        {footer}
      </div>
      {social}
      <BackToTop />
      <ScrollMemory />
    </TransitionProvider>
  );
}
