"use client";

export default function MediaFilterBar({
  q,
  setQ,
  activeTag,
  setActiveTag,
  allTags,
}: {
  q: string;
  setQ: (value: string) => void;
  activeTag: string;
  setActiveTag: (value: string) => void;
  allTags: string[];
}) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, location, event, people, tag…"
          className="w-full rounded-2xl border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring sm:max-w-md"
        />
        <button
          type="button"
          onClick={() => {
            setQ("");
            setActiveTag("");
          }}
          className="rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
        >
          Clear
        </button>
      </div>

      {allTags.length ? (
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
      ) : null}
    </>
  );
}