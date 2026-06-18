"use client";

import { FormEvent } from "react";

type AdminSearchBarProps = {
  value: string;
  placeholder: string;
  showClear: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  className?: string;
  inputClassName?: string;
};

export function AdminSearchBar({
  value,
  placeholder,
  showClear,
  onChange,
  onSubmit,
  onClear,
  className = "flex w-full flex-wrap gap-2 md:w-auto",
  inputClassName = "min-w-0 flex-1 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring md:w-80",
}: AdminSearchBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />

      <button type="submit" className="rounded-xl border px-4 py-2 text-sm hover:bg-accent">
        Search
      </button>

      {showClear ? (
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
        >
          Clear
        </button>
      ) : null}
    </form>
  );
}