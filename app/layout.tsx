import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/site/Navbar";

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
        <Navbar />
        {children}
      </body>
    </html>
  );
}
