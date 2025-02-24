import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import Layout from "@/components/layout/Layout";

export const metadata: Metadata = {
  title: "Hussain Marzooq - Portfolio",
  description: "Personal portfolio showcasing photography, film, web development, NFTs, and dance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <Layout>
            {children}
          </Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
