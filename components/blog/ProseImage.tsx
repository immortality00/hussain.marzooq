import cloudinaryImageLoader from "@/lib/cloudinary-image-loader";
import { IMAGE_DEVICE_SIZES } from "@/lib/image-sizes";

// The post column is at most 768px wide, so 1920 covers it at 2x.
const WIDTHS = IMAGE_DEVICE_SIZES.filter((width) => width <= 1920);
const SIZES = "(max-width: 768px) 100vw, 768px";

/**
 * A picture in a post's text. A Cloudinary photo goes through the same loader as every other
 * image, so the browser picks a sized copy instead of the full original; anything else is as written.
 */
export function ProseImage({ src, alt, title }: { src?: unknown; alt?: string; title?: string }) {
  if (typeof src !== "string" || !src) return null;
  const sized = WIDTHS.map((width) => ({ width, url: cloudinaryImageLoader({ src, width }) }));
  const resized = sized.some(({ url }) => url !== src);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- markdown has no dimensions for next/image; srcSet comes from the same loader
    <img
      src={resized ? cloudinaryImageLoader({ src, width: 1200 }) : src}
      srcSet={resized ? sized.map(({ width, url }) => `${url} ${width}w`).join(", ") : undefined}
      sizes={resized ? SIZES : undefined}
      alt={alt ?? ""}
      title={title}
      loading="lazy"
      decoding="async"
    />
  );
}
