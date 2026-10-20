"use client";

import { usePathname } from "next/navigation";
import { TransitionProvider } from "@/components/transitions/TransitionContext";
import { Navbar } from "@/components/site/Navbar";
import type { DisciplineSlug } from "@/lib/disciplines";

export function SiteFrame({
  children,
  footer,
  transitionImages,
  activeDisciplines,
  fullPageLoads,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  transitionImages: string[];
  activeDisciplines: DisciplineSlug[];
  fullPageLoads?: boolean;
}) {
  if (usePathname().startsWith("/admin")) return <>{children}</>;

  return (
    <TransitionProvider images={transitionImages} fullPageLoads={fullPageLoads}>
      <Navbar activeDisciplines={activeDisciplines} />
      <div className="relative z-10">
        <div id="main-content" tabIndex={-1} className="relative">
          {children}
        </div>
        {footer}
      </div>
    </TransitionProvider>
  );
}
