"use client";

export default function IconButton({
  title,
  tone = "default",
  children,
  onClick,
}: {
  title: string;
  tone?: "default" | "danger";
  children: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={[
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
        tone === "danger"
          ? "hover:border-rose-500/30 hover:bg-rose-500/10"
          : "hover:bg-accent",
      ].join(" ")}
    >
      {children}
    </button>
  );
}