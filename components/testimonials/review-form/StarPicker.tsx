"use client";

export function StarPicker({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (value: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setRating(value)}
          className={`text-3xl transition-transform hover:scale-110 ${
            value <= rating ? "text-amber-500" : "text-muted-foreground/30"
          }`}
          aria-label={`Set ${value} star rating`}
        >
          ★
        </button>
      ))}
    </div>
  );
}