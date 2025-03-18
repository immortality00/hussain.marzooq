import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/transitions/PageTransition";
import { Playfair_Display, Inter, Cormorant_Garamond } from 'next/font/google';
import ThemeProvider from "@/components/theme/ThemeProvider";
import ThemeScript from "@/components/theme/ThemeScript";
import '../styles/goldTheme.css';
import '../styles/goldNavigation.css';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-script',
});

export const metadata: Metadata = {
  title: "Hussain Marzooq - Portfolio",
  description: "Personal portfolio showcasing photography, film, web development, NFTs, and dance.",
  icons: {
    icon: '/images/branding/favicon.png',
    apple: '/images/branding/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${inter.variable} ${cormorantGaramond.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
        <ThemeProvider>
          <AuthProvider>
            <Layout>
              <PageTransition>
                {children}
              </PageTransition>
            </Layout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
