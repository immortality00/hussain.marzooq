import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo/site-url";

const SITE_NAME = "Hussain.Art";
const SITE_DESCRIPTION =
  "Cinematic photography, film, NFTs, dance, and creative development by Hussain Marzooq.";

export const ROOT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};
