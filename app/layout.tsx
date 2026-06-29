import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AppShell } from "@/components/site/AppShell";
import { CustomCursor } from "@/components/site/CustomCursor";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "HM Visuals",
  description:
    "Cinematic photography, film, NFTs, dance, and creative development by Hussain Marzooq.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <CustomCursor />
          <AppShell>{children}</AppShell>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
