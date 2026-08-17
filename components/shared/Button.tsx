import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Two button looks, both modelled on the hero's own pills (Hussain, 2026-08-18:
// "all the other buttons follow the hero section book button style").
// - ghost: the hero "Book" outline — the default, used by every button except
//   the sticky bar's. Hover inverts to a white fill with black text.
// - solid: the hero "See the work" white pill — used by the sticky bar "Book".
//   Hover softens white → grey.
// Geometry + motion live in globals.css (.hm-btn). The hero keeps its own px-6
// pills inline and is the one deliberate exception.
export type ButtonVariant = "ghost" | "solid";

const VARIANT: Record<ButtonVariant, string> = {
  ghost: "border border-white/30 text-white hover:border-white hover:bg-white hover:text-black",
  solid: "bg-white text-black hover:bg-neutral-200",
};

export function buttonClasses(variant: ButtonVariant = "ghost", className?: string) {
  return cn("hm-btn", VARIANT[variant], className);
}

type BaseProps = {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

type ButtonProps = BaseProps &
  (
    | ({ href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">)
    | ({ href?: undefined } & Omit<ComponentProps<"button">, "className" | "children">)
  );

export function Button({ variant = "ghost", className, children, ...rest }: ButtonProps) {
  const classes = buttonClasses(variant, className);

  if (rest.href !== undefined) {
    const { href, ...linkRest } = rest;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonRest } = rest;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
