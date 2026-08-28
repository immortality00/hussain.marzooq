import Link from "next/link";
import type { ComponentProps, ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

export type AdminButtonVariant = "default" | "solid" | "danger" | "warning" | "ghost";
export type AdminButtonSize = "xs" | "sm" | "md";

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

const SIZE: Record<AdminButtonSize, string> = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

const VARIANT: Record<AdminButtonVariant, string> = {
  default: "border hover:bg-accent",
  solid: "bg-foreground text-background hover:opacity-90",
  danger: "border border-destructive/30 text-destructive hover:bg-destructive/10",
  warning:
    "border border-amber-500/40 text-amber-700 hover:bg-amber-500/10 dark:text-amber-300",
  ghost: "hover:bg-accent/40",
};

export function adminButtonClasses(
  variant: AdminButtonVariant = "default",
  size: AdminButtonSize = "md",
  className?: string,
) {
  return cn(BASE, SIZE[size], VARIANT[variant], className);
}

type BaseProps = {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  className?: string;
  children: ReactNode;
  ref?: Ref<HTMLAnchorElement & HTMLButtonElement>;
};

type AdminButtonProps = BaseProps &
  (
    | ({ href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children" | "ref">)
    | ({ href?: undefined } & Omit<ComponentProps<"button">, "className" | "children" | "ref">)
  );

export function AdminButton({
  variant = "default",
  size = "md",
  className,
  children,
  ref,
  ...rest
}: AdminButtonProps) {
  const classes = adminButtonClasses(variant, size, className);

  if (rest.href !== undefined) {
    const { href, ...linkRest } = rest;
    return (
      <Link ref={ref} href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonRest } = rest;
  return (
    <button ref={ref} type={type} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
