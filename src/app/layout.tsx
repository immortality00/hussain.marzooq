import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/transitions/PageTransition";
import { Playfair_Display, Inter } from 'next/font/google';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Hussain Marzooq - Portfolio",
  description: "Personal portfolio showcasing photography, film, web development, NFTs, and dance.",
};

function initTheme() {
  return `
    (function() {
      function getThemePreference() {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
          return localStorage.getItem('theme');
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      const theme = getThemePreference();
      
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  `;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initTheme() }} />
      </head>
      <body className="antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
        <AuthProvider>
          <Layout>
            <PageTransition>
              {children}
            </PageTransition>
          </Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
