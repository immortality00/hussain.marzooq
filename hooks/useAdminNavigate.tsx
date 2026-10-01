"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminPageCover } from "@/components/admin/AdminPageCover";

export function useAdminNavigate() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(href: string) {
    startTransition(() => router.push(href));
  }

  return { navigate, navigationCover: pending ? <AdminPageCover /> : null };
}
