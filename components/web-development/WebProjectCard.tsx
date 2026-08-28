import { ArrowUpRight } from "lucide-react";

export function WebProjectCard({
  href,
  label,
  priority = false,
}: {
  href: string;
  label: string;
  priority?: boolean;
}) {
  const previewSrc = `/api/web-projects/preview?url=${encodeURIComponent(href)}&v=2`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-no-transition
      aria-label={`${label} — visit site`}
      className="group block overflow-hidden rounded-[2rem] border bg-card shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-[2px]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- proxied external screenshot, not a Cloudinary asset */}
        <img
          src={previewSrc}
          alt={`Preview of ${label}`}
          loading={priority ? "eager" : "lazy"}
          className="absolute inset-0 size-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <span className="truncate text-sm font-medium tracking-tight">{label}</span>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
          Visit site
          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </a>
  );
}
