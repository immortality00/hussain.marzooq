"use client";

import { adminButtonClasses } from "@/components/admin/AdminButton";

// Previous / Next item in the media editor's header. Not "Back" / "Next", which are the wizard's own steps.
export function MediaItemNav({
  hasPrevious,
  hasNext,
  loading,
  disabled,
  onPrevious,
  onNext,
}: {
  hasPrevious: boolean;
  hasNext: boolean;
  loading: boolean;
  disabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onPrevious}
        disabled={disabled || !hasPrevious}
        className={adminButtonClasses("default", "md")}
      >
        Previous item
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled || loading || !hasNext}
        className={adminButtonClasses("default", "md")}
      >
        {loading ? "Loading…" : "Next item"}
      </button>
    </>
  );
}
