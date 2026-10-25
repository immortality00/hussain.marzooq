import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SmartImage from "@/components/shared/SmartImage";
import { SubscribeConfirm } from "@/components/blog/SubscribeConfirm";
import { getPageSections } from "@/lib/server/page-sections";
import { getBlogActive } from "@/lib/server/page-settings";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Confirm your subscription — Hussain.Art",
  robots: { index: false, follow: false },
};

/** Opened from the confirmation email. The homepage's lead photograph sits behind the answer; `dark` keeps the
 *  text and buttons light on its scrim in either theme. */
export default async function SubscribePage() {
  if (!(await getBlogActive())) redirect("/");
  const backdrop = (await getPageSections("home")).hero.images[0] ?? null;

  return (
    <main
      className={cn(
        "relative isolate flex min-h-[calc(100dvh-3.5rem)] items-center justify-center overflow-hidden px-4 py-20",
        backdrop && "dark"
      )}
    >
      {backdrop ? (
        <>
          <SmartImage
            src={backdrop.url}
            alt=""
            fill
            preload
            sizes="100vw"
            className="hm-settle -z-10 object-cover"
            style={backdrop.focus ? { objectPosition: `${backdrop.focus.x}% ${backdrop.focus.y}%` } : undefined}
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-black/70" />
        </>
      ) : null}
      <SubscribeConfirm />
    </main>
  );
}
