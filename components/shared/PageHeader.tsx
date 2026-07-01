import { AnimatedText } from "@/components/shared/AnimatedText";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  titleClassName?: string;
}

export function PageHeader({ title, description, className, titleClassName }: PageHeaderProps) {
  return (
    <div className={className}>
      <h1
        className={`text-4xl font-semibold tracking-tight sm:text-5xl${titleClassName ? ` ${titleClassName}` : ""}`}
      >
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
