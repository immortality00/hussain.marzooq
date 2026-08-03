import Image from "next/image";

export function SafeImage({
  src,
  alt,
  className,
  sizes = "240px",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  return <Image src={src} alt={alt} fill className={className} sizes={sizes} />;
}
