import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AppShell } from "@/components/site/AppShell";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getTransitionImages } from "@/lib/server/public-media";
import { SITE_URL } from "@/lib/seo/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Hussain.Art",
  description:
    "Cinematic photography, film, NFTs, dance, and creative development by Hussain Marzooq.",
  openGraph: {
    type: "website",
    siteName: "Hussain.Art",
    title: "Hussain.Art",
    description:
      "Cinematic photography, film, NFTs, dance, and creative development by Hussain Marzooq.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hussain.Art",
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
