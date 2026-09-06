import type { Metadata } from "next";

const SITE_NAME = "HM Visuals";

const FALLBACK_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "HM Visuals — Hussain Marzooq",
};

type OgType = "website" | "article" | "profile";

export function buildPublicMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: OgType;
}): Metadata {
  const trimmed = image?.trim();
  const imageField = { images: [trimmed ? trimmed : FALLBACK_IMAGE] };
  const canonical = path.startsWith("/") ? path : `/${path}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type,
      url: canonical,
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
