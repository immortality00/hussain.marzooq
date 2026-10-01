"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";
import { AdminPageCover } from "./AdminPageCover";

function PendingCover() {
  const { pending } = useLinkStatus();
  return pending ? <AdminPageCover /> : null;
}

export function AdminLink({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <PendingCover />
    </Link>
  );
}
