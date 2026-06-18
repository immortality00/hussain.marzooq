"use client";

type GalleryFormFieldsProps = {
  editing: boolean;
  title: string;
  slug: string;
  description: string;
  password: string;
  expiresAtLocal: string;
  isActive: boolean;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onExpiresAtLocalChange: (value: string) => void;
  onIsActiveChange: (value: boolean) => void;
};

export function GalleryFormFields({
  editing,
  title,
  slug,
  description,
  password,
  expiresAtLocal,
  isActive,
  onTitleChange,
  onSlugChange,
  onDescriptionChange,
  onPasswordChange,
  onExpiresAtLocalChange,
  onIsActiveChange,
}: GalleryFormFieldsProps) {
  return (
    <section className="rounded-[2rem] border p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Slug</label>
          <input
            value={slug}
            onChange={(event) => onSlugChange(event.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            className="min-h-28 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {editing ? "New password (optional)" : "Password"}
          </label>
          <input
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            type="password"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Expiry</label>
          <input
            type="datetime-local"
            value={expiresAtLocal}
            onChange={(event) => onExpiresAtLocalChange(event.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => onIsActiveChange(event.target.checked)}
          />
          Active
        </label>
      </div>
    </section>
  );
}