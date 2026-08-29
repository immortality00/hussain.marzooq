"use client";

import SmartImage from "@/components/shared/SmartImage";

export function PreviewImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  return <SmartImage src={src} alt={alt} fill className={className} sizes="220px" />;
}