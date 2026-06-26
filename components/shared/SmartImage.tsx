import NextImage, { type ImageProps } from "next/image";

/**
 * Drop-in for next/image that auto-couples priority → loading="eager".
 * Pass priority={true} and loading is forced to "eager"; otherwise "lazy".
 * This prevents the LCP warning that fires when priority is set without loading="eager".
 */
export default function SmartImage({ priority, loading, ...props }: ImageProps) {
  const eager = priority === true;
  return (
    <NextImage
      {...props}
      priority={eager}
      loading={eager ? "eager" : (loading ?? "lazy")}
      fetchPriority={eager ? "high" : "auto"}
    />
  );
}
