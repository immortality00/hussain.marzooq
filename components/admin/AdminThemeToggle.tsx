"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function AdminThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="rounded-xl border px-3 py-2 text-sm transition-colors hover:bg-accent/40"
    >
      {mounted ? (
        resolvedTheme === "dark" ? (
          <Sun size={15} />
        ) : (
          <Moon size={15} />
        )
      ) : (
        <span className="inline-block h-[15px] w-[15px]" />
      )}
    </button>
  );
}
