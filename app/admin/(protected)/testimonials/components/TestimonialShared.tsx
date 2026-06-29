import Image from "next/image";

export type TestimonialItem = {
  id: string;
  name: string;
  email: string | null;
  about: string | null;
  location: string | null;
  review: string;
  rating: number;
  profilePhotoUrl: string | null;
  photoUrls: string[];
  isApproved: boolean;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (i < rating ? "★" : "☆")).join("");
}

export function formatDate(value: string | null) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function identityLine(item: TestimonialItem) {
  return [item.about, item.location].filter(Boolean).join(" • ");
}

export function Avatar({ name, profilePhotoUrl }: { name: string; profilePhotoUrl: string | null }) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted/55 ring-1 ring-border/60">
      {profilePhotoUrl ? (
        <Image src={profilePhotoUrl} alt={name} fill className="object-cover" sizes="56px" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}

export function StatusPill({ approved }: { approved: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ring-1 ${
        approved
          ? "bg-green-500/10 text-green-700 ring-green-500/20 dark:text-green-300"
          : "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300"
      }`}
    >
      {approved ? "Approved" : "Pending"}
    </span>
  );
}
