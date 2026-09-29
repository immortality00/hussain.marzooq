import { launchScreenHtml } from "@/lib/launch-screen";

export const dynamic = "force-static";

export function GET() {
  return new Response(launchScreenHtml(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
