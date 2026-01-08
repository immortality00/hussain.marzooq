import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/site/AppShell";

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
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
