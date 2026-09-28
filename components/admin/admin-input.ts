import { cn } from "@/lib/utils";

export type AdminInputSize = "sm" | "md";

const FIELD =
  "w-full rounded-xl border bg-background text-base md:text-sm aria-invalid:border-destructive";

const SIZE: Record<AdminInputSize, string> = {
  sm: "px-2 py-1",
  md: "px-3 py-2",
};

export function adminInputClasses(size: AdminInputSize = "md", className?: string) {
  return cn(
    FIELD,
    SIZE[size],
    "outline-none focus:ring-2 focus:ring-ring aria-invalid:focus:ring-destructive disabled:cursor-not-allowed disabled:opacity-60",
    className,
  );
}

export function adminFieldShellClasses(className?: string) {
  return cn(FIELD, "focus-within:ring-2 focus-within:ring-ring", className);
}

export function adminCheckboxClasses(className?: string) {
  return cn("size-4 shrink-0 accent-foreground disabled:cursor-not-allowed", className);
}
