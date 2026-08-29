import type { Metadata } from "next";

const SITE_NAME = "HM Visuals";

type OgType = "website" | "article" | "profile";

export function buildPublicMetadata({
  title,
  description,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  image?: string;
  type?: OgType;
}): Metadata {
  const trimmed = image?.trim();
  const imageField = trimmed ? { images: [trimmed] } : {};
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type,
      siteName: SITE_NAME,
      ...imageField,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...imageField,
    },
  };
}
