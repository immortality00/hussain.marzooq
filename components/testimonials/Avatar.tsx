import { SafeImage } from "./SafeImage";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export function Avatar({
  name,
  profilePhotoUrl,
  size = "card",
}: {
  name: string;
  profilePhotoUrl: string | null;
  size?: "card" | "modal";
}) {
  const sizeClass = size === "modal" ? "h-16 w-16 text-lg" : "h-10 w-10 text-xs";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/70 ${sizeClass}`}
    >
      {profilePhotoUrl ? (
        <SafeImage src={profilePhotoUrl} alt={name} className="object-cover" sizes="96px" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-medium text-muted-foreground">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}
