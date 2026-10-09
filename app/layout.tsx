import "./globals.css";
import { RootDocument } from "@/components/site/RootDocument";
import { ROOT_METADATA } from "@/lib/seo/root-metadata";

export const metadata = ROOT_METADATA;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootDocument>{children}</RootDocument>;
}
