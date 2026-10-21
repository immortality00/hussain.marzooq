import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteFrame } from "@/components/site/SiteFrame";
import { SocialLinks } from "@/components/site/SocialLinks";
import { getTransitionImages } from "@/lib/server/public-media";
import { getFooterPageSettings } from "@/lib/server/page-settings";
import { getSocialItems } from "@/lib/server/social-links";
import { DISCIPLINES } from "@/lib/disciplines";

export async function PublicFrame({
  children,
  fullPageLoads,
}: {
  children: React.ReactNode;
  fullPageLoads?: boolean;
}) {
  const [transitionImages, pageSettings, socialItems] = await Promise.all([
    getTransitionImages(),
    getFooterPageSettings(),
    getSocialItems(),
  ]);
  const active = new Set(pageSettings.filter((p) => p.isActive).map((p) => p.slug));
  const activeDisciplines = DISCIPLINES.filter((d) => active.has(d.slug)).map((d) => d.slug);
  return (
    <SiteFrame
      footer={<SiteFooter />}
      social={<SocialLinks items={socialItems} />}
      transitionImages={transitionImages}
      activeDisciplines={activeDisciplines}
      fullPageLoads={fullPageLoads}
    >
      {children}
    </SiteFrame>
  );
}
