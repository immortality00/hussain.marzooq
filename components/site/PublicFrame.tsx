import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteFrame } from "@/components/site/SiteFrame";
import { getTransitionImages } from "@/lib/server/public-media";
import { getFooterPageSettings } from "@/lib/server/page-settings";
import { DISCIPLINES } from "@/lib/disciplines";

export async function PublicFrame({
  children,
  fullPageLoads,
}: {
  children: React.ReactNode;
  fullPageLoads?: boolean;
}) {
  const [transitionImages, pageSettings] = await Promise.all([getTransitionImages(), getFooterPageSettings()]);
  const active = new Set(pageSettings.filter((p) => p.isActive).map((p) => p.slug));
  const activeDisciplines = DISCIPLINES.filter((d) => active.has(d.slug)).map((d) => d.slug);
  return (
    <SiteFrame
      footer={<SiteFooter />}
      transitionImages={transitionImages}
      activeDisciplines={activeDisciplines}
      fullPageLoads={fullPageLoads}
    >
      {children}
    </SiteFrame>
  );
}
