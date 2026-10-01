import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteFrame } from "@/components/site/SiteFrame";
import { getTransitionImages } from "@/lib/server/public-media";

export async function PublicFrame({ children }: { children: React.ReactNode }) {
  const transitionImages = await getTransitionImages();
  return (
    <SiteFrame footer={<SiteFooter />} transitionImages={transitionImages}>
      {children}
    </SiteFrame>
  );
}
