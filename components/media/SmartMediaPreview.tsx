import Image from "next/image";

export type SmartMediaPreviewMode = "image" | "video" | "embed" | "empty";
export type SmartMediaPreviewFit = "cover" | "contain";

type SmartMediaPreviewProps = {
  mode: SmartMediaPreviewMode;
  src?: string | null;
  embedUrl?: string | null;
  title: string;
  fit?: SmartMediaPreviewFit;
  imagePriority?: boolean;
  sizes: string;
  imageClassName?: string;
  videoClassName?: string;
  emptyClassName?: string;
  showPlayBadge?: boolean;
  showEmbedPlaceholder?: boolean;
};

function PlayBadge() {
  return (
    <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs text-white backdrop-blur">
      <span className="inline-block h-2 w-2 rounded-full bg-white" />
      Play
    </div>
  );
}

function EmbedPlaceholder({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl backdrop-blur">
          ▶
        </div>
        <div className="line-clamp-2 text-sm font-medium">{title}</div>
      </div>
    </div>
  );
}

export default function SmartMediaPreview({
  mode,
  src,
  title,
  fit = "cover",
  imagePriority = false,
  sizes,
  imageClassName,
  videoClassName,
  emptyClassName,
  showPlayBadge = false,
  showEmbedPlaceholder = true,
}: SmartMediaPreviewProps) {
  if (mode === "image" && src) {
    return (
      <Image
        src={src}
        alt={title}
        fill
        className={
          imageClassName ??
          `${fit === "contain" ? "object-contain" : "object-cover"} transition-transform duration-700 hover:scale-[1.03]`
        }
        sizes={sizes}
        loading={imagePriority ? "eager" : "lazy"}
        fetchPriority={imagePriority ? "high" : undefined}
      />
    );
  }

  if (mode === "video" && src) {
    return (
      <div className="absolute inset-0 bg-black">
        <video
          src={src}
          className={videoClassName ?? `h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
          muted
          playsInline
          preload="metadata"
        />
        {showPlayBadge ? <PlayBadge /> : null}
      </div>
    );
  }

  if (mode === "embed" && showEmbedPlaceholder) {
    return <EmbedPlaceholder title={title} />;
  }

  return <div className={emptyClassName ?? "absolute inset-0 bg-linear-to-br from-muted to-background"} />;
}