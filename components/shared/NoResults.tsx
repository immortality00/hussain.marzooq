import type { ReactNode } from "react";

export function NoResults({
  children = "No matches.",
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-8 text-sm text-muted-foreground${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
