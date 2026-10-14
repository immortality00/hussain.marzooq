"use client";

import { usePathname } from "next/navigation";
import { TransitionProvider } from "@/components/transitions/TransitionContext";

export function SiteFrame({
  children,
  footer,
  transitionImages,
  fullPageLoads,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  transitionImages: string[];
  fullPageLoads?: boolean;
}) {
  if (usePathname().startsWith("/admin")) return <>{children}</>;

  return (
    <TransitionProvider images={transitionImages} fullPageLoads={fullPageLoads}>
      <div className="relative z-10">
        <div id="main-content" tabIndex={-1} className="relative">
          {children}
        </div>
        {footer}
      </div>
    </TransitionProvider>
  );
}
