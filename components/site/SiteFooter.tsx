import Link from "next/link";
import { getFooterPageSettings } from "@/lib/server/page-settings";
import { DISCIPLINES } from "@/lib/disciplines";
import { EmailDirectory } from "@/components/shared/EmailDirectory";
import { FooterSocialLinks } from "@/components/site/SocialLinks";
import { getFooterEmails } from "@/lib/server/email-list";
import type { SocialItem } from "@/lib/social-links";

const ALWAYS_ON_PRIMARY = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

const PRIMARY_DISCIPLINE_SLUGS = new Set(["photography", "videography"]);

const COLUMN_HEADING = "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground";

function FooterLinkColumn({ heading, links }: { heading: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <div className={COLUMN_HEADING}>{heading}</div>
      <div className="mt-4 flex flex-col gap-3">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Below 1024px the footer is two columns: Main beside Explore, the emails two to a row, then
// the social icons. From 1024px it is four columns, the icons under the opening lines.
export async function SiteFooter({ socialItems }: { socialItems: SocialItem[] }) {
  const [pageSettings, emails] = await Promise.all([getFooterPageSettings(), getFooterEmails()]);
  const activeSet = new Set(pageSettings.filter((p) => p.isActive).map((p) => p.slug));

  const secondaryAlwaysOn = [
    { href: "/people", label: "People" },
    { href: "/testimonials", label: "Testimonials" },
    ...(activeSet.has("blog") ? [{ href: "/blog", label: "Blog" }] : []),
  ];

  const activeDisciplines = DISCIPLINES.filter((d) => activeSet.has(d.slug));
  const primaryLinks = [
    ...activeDisciplines.filter((d) => PRIMARY_DISCIPLINE_SLUGS.has(d.slug)),
    ...ALWAYS_ON_PRIMARY,
  ];
  const secondaryLinks = [
    ...activeDisciplines.filter((d) => !PRIMARY_DISCIPLINE_SLUGS.has(d.slug)),
    ...secondaryAlwaysOn,
  ];
  const iconRow = "-ml-2 flex-wrap gap-1";

  return (
    <footer data-site-footer className="border-t bg-card">
      <div className="section-shell py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.2fr_0.7fr_0.7fr_1fr] lg:gap-10">
          <div className="col-span-2 max-w-md lg:col-span-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Visual work shaped with cinematic clarity.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Photography, film, movement, creative development, and collectible work — built with a clean visual language and a strong artistic point of view.
            </p>
            <FooterSocialLinks items={socialItems} className={`mt-6 hidden lg:flex ${iconRow}`} />
          </div>

          <FooterLinkColumn heading="Main" links={primaryLinks} />
          <FooterLinkColumn heading="Explore" links={secondaryLinks} />

          {emails.length > 0 && (
            <div className="col-span-2 lg:col-span-1">
              <div className={COLUMN_HEADING}>Email</div>
              <EmailDirectory
                emails={emails}
                className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 lg:flex lg:flex-col"
              />
            </div>
          )}

          <FooterSocialLinks items={socialItems} className={`col-span-2 flex lg:hidden ${iconRow}`} />
        </div>

        {/* Room under the last row for the fixed Back to top button (and the booking bar
            under it), so neither covers the row at the bottom of the page. */}
        <div className="mt-10 flex flex-col gap-3 border-t pt-6 pb-6 with-sticky-cta:pb-30 md:with-sticky-cta:pb-26 xl:with-sticky-cta:pb-20 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4">
            <span
              role="img"
              aria-label="Hussain.Art"
              className="hm-wordmark w-[180px] text-foreground/70"
            />
            <span>Hussain.Art — Dubai based, available worldwide.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <span>Built for clarity, atmosphere, and strong visual storytelling.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
