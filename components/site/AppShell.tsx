"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/site/Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      {children}
    </>
  );
}
