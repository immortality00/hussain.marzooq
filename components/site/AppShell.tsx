"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/site/Navbar";
import { SiteFooter } from "@/components/site/SiteFooter";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="page-shell min-h-screen">
      <div className="page-vignette" />
      <div className="site-grid-bg absolute inset-0" />
      <Navbar />
      <div className="relative z-10">{children}</div>
      <SiteFooter />
    </div>
  );
}