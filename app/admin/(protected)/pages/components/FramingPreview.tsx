"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { heroFocusVars, type HeroFocus } from "@/lib/hero-focus";
import type { HeroPreviewShape } from "@/lib/hero-preview";

const PREVIEW_HEIGHT = 220;

// One hero shape at a fixed height, drawn by the same `.hm-focus-frame` rule as
// the hero itself, so what it shows is what the homepage shows.
export function FramingPreview({ url, focus, shape }: { url: string; focus: HeroFocus; shape: HeroPreviewShape }) {
  const scale = PREVIEW_HEIGHT / shape.height;
  const photoWidth = Math.round(shape.photo * scale);

  return (
    <figure className="space-y-1.5">
      <div
        className="relative overflow-hidden rounded-xl bg-muted ring-1 ring-border"
        style={{ width: Math.max(8, Math.round(shape.strip * scale)), height: PREVIEW_HEIGHT }}
      >
        <div
          className="hm-focus-frame absolute inset-y-0"
          style={{ width: photoWidth, ...heroFocusVars(focus) } as CSSProperties}
        >
          <Image src={url} alt="" fill sizes={`${photoWidth}px`} className="object-cover" />
        </div>
      </div>
      <figcaption className="text-xs text-muted-foreground">{shape.label}</figcaption>
    </figure>
  );
}
