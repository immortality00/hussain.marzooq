import { AnimatedText } from "@/components/shared/AnimatedText";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, className }: PageHeaderProps) {
  return (
    <div className={className}>
      {eyebrow && (
        <div className="inline-flex rounded-full border px-3 py-1 text-[11px] tracking-[0.16em] text-muted-foreground">
          {eyebrow}
        </div>
      )}
      <h1 className={`text-4xl font-semibold tracking-tight sm:text-5xl${eyebrow ? " mt-5" : ""}`}>
        <AnimatedText>{title}</AnimatedText>
      </h1>
      {description && (
        <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
