"use client";

import Image from "next/image";

export function PreviewImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  return <Image src={src} alt={alt} fill unoptimized className={className} sizes="220px" />;
}