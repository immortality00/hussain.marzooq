import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AppShell } from "@/components/site/AppShell";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getTransitionImages } from "@/lib/server/public-media";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hussain-marzooq.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "HM Visuals",
  description:
    "Cinematic photography, film, NFTs, dance, and creative development by Hussain Marzooq.",
  openGraph: {
    type: "website",
    siteName: "HM Visuals",
    title: "HM Visuals",
    description:
      "Cinematic photography, film, NFTs, dance, and creative development by Hussain Marzooq.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HM Visuals",
    description:
      "Cinematic photography, film, NFTs, dance, and creative development by Hussain Marzooq.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const transitionImages = await getTransitionImages();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AppShell footer={<SiteFooter />} transitionImages={transitionImages}>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
