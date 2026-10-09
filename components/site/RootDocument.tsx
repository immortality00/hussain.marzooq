import { ThemeProvider } from "next-themes";
import { AppShell } from "@/components/site/AppShell";
import { FONT_VARIABLES } from "@/lib/fonts";

export function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={FONT_VARIABLES} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
