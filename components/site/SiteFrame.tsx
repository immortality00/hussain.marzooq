"use client";

import { usePathname } from "next/navigation";
import { TransitionProvider } from "@/components/transitions/TransitionContext";

export function SiteFrame({
  children,
  footer,
  transitionImages,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  transitionImages: string[];
}) {
  if (usePathname().startsWith("/admin")) return <>{children}</>;

  return (
    <TransitionProvider images={transitionImages}>
      <div id="main-content" tabIndex={-1} className="relative z-10">
        {children}
      </div>
      <div className="relative z-10">{footer}</div>
    </TransitionProvider>
  );
}
