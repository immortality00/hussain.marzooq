import { Button } from "@/components/shared/Button";

const INVERSE_SOLID = "bg-background text-foreground hover:bg-background/90";
const INVERSE_GHOST =
  "border-background/30 text-background hover:border-background hover:bg-background hover:text-foreground";

type PortfolioFallbackPanelLink = {
  href: string;
  label: string;
  primary?: boolean;
};

type PortfolioFallbackPanelItem = {
  title: string;
  text: string;
};

export function PortfolioFallbackPanel({
  title,
  text,
  items,
  links,
}: {
  title: string;
  text: string;
  items: PortfolioFallbackPanelItem[];
  links?: PortfolioFallbackPanelLink[];
}) {
  return (
    <section className="mt-10 overflow-hidden rounded-[2.25rem] border bg-background/70 shadow-sm backdrop-blur">
      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative min-h-[20rem] overflow-hidden bg-foreground text-background">
          <div className="relative flex h-full min-h-[20rem] flex-col justify-end p-6 sm:p-8">
            <h2 className="max-w-xl text-3xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-background/70">{text}</p>

            {links?.length ? (
              <div className="mt-7 flex flex-wrap gap-3">
                {links.map((link) => (
                  <Button
                    key={link.href}
                    href={link.href}
                    variant={link.primary ? "solid" : "ghost"}
                    className={link.primary ? INVERSE_SOLID : INVERSE_GHOST}
                  >
                    {link.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8">
          {items.map((item) => (
            <article
              key={item.title}
              className="border-t border-border pt-6 first:border-t-0 first:pt-0"
            >
              <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}