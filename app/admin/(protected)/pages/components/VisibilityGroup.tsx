"use client";

import { Eye } from "lucide-react";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { GroupCard } from "./GroupCard";

export function VisibilityGroup({
  isActive,
  onToggle,
}: {
  isActive: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <GroupCard icon={Eye} label="Visibility" tint="visibility">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Inactive pages redirect visitors to the homepage and are hidden from the Work overlay.
        </p>
        <AdminToggle checked={isActive} onChange={onToggle} label="Toggle page visibility" />
      </div>
    </GroupCard>
  );
}
