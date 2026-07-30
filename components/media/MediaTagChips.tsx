"use client";

export default function MediaTagChips({
  activeTag,
  setActiveTag,
  allTags,
}: {
  activeTag: string;
  setActiveTag: (value: string) => void;
  allTags: string[];
}) {
  if (!allTags.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setActiveTag("")}
        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
          activeTag === "" ? "bg-accent" : "hover:bg-accent/40"
        }`}
      >
        All
      </button>

      {allTags.slice(0, 30).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setActiveTag(t === activeTag ? "" : t)}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            t === activeTag ? "bg-accent" : "hover:bg-accent/40"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
