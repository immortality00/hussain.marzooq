import { cn } from "@/lib/utils";

export function chipClasses(active = false, className?: string) {
  return cn(
    "hm-chip",
    active
      ? "border-foreground bg-foreground text-background"
      : "border-border text-muted-foreground hover:text-foreground",
    className
  );
}
