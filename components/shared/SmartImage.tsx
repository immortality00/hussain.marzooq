import NextImage, { type ImageProps } from "next/image";

export default function SmartImage({ preload, loading, ...props }: ImageProps) {
  const eager = preload === true;
  return (
    <NextImage
      {...props}
      preload={eager}
      loading={eager ? "eager" : (loading ?? "lazy")}
      fetchPriority={eager ? "high" : "auto"}
    />
  );
}
