import Link from "next/link";
import type { ComponentProps, ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

// Two button looks, both modelled on the hero's own pills (Hussain, 2026-08-18:
// "all the other buttons follow the hero section book button style").
// - ghost: the hero "Book" outline — the default, used by every button except
//   the sticky bar's. Hover inverts to a solid fill with inverted text.
// - solid: the hero "See the work" pill — used by the sticky bar "Book".
//   Hover softens the fill.
// Both follow the theme via the foreground/background tokens, so a button on a
// page surface stays legible in light mode as well as dark. `onImage` pins the
// pair to white/black for the buttons that sit on a dark photo scrim, which is
// dark in both themes.
// Geometry + motion live in globals.css (.hm-btn). The hero keeps its own px-6
// pills inline and is the one deliberate exception.
export type ButtonVariant = "ghost" | "solid";

const ON_SURFACE: Record<ButtonVariant, string> = {
  ghost:
    "border border-foreground/30 text-foreground hover:border-foreground hover:bg-foreground hover:text-background",
  solid: "bg-foreground text-background hover:bg-foreground/90",
};

const ON_IMAGE: Record<ButtonVariant, string> = {
  ghost: "border border-white/30 text-white hover:border-white hover:bg-white hover:text-black",
  solid: "bg-white text-black hover:bg-neutral-200",
};

export function buttonClasses(
  variant: ButtonVariant = "ghost",
  className?: string,
  onImage = false
) {
  return cn("hm-btn", (onImage ? ON_IMAGE : ON_SURFACE)[variant], className);
}

type BaseProps = {
  variant?: ButtonVariant;
  onImage?: boolean;
  className?: string;
  children: ReactNode;
  ref?: Ref<HTMLAnchorElement & HTMLButtonElement>;
};

type ButtonProps = BaseProps &
  (
    | ({ href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children" | "ref">)
    | ({ href?: undefined } & Omit<ComponentProps<"button">, "className" | "children" | "ref">)
  );

export function Button({
  variant = "ghost",
  onImage = false,
  className,
  children,
  ref,
  ...rest
}: ButtonProps) {
  const classes = buttonClasses(variant, className, onImage);
  const magnetic = ref ? { "data-magnetic": "" } : undefined;

  if (rest.href !== undefined) {
    const { href, ...linkRest } = rest;
    return (
      <Link ref={ref} href={href} className={classes} {...magnetic} {...linkRest}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonRest } = rest;
  return (
    <button ref={ref} type={type} className={classes} {...magnetic} {...buttonRest}>
      {children}
    </button>
  );
}
