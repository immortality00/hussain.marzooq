"use client";

import { useRef, type RefObject } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onValueChange?: (value: string) => void;
  placeholder: string;
  showClear?: boolean;
  onClear?: () => void;
  wrapperClassName?: string;
  inputClassName?: string;
  resultText?: string;
  // For a parent that puts the cursor in the box itself (ExpandingSearch).
  inputRef?: RefObject<HTMLInputElement | null>;
  inputId?: string;
};

// 16px below 768px: iOS zooms the page into any field smaller than that.
const PUBLIC_INPUT =
  "w-full rounded-2xl border bg-background px-4 py-2 pr-11 text-base outline-none focus:ring-2 focus:ring-ring md:text-sm";

export function SearchInput({
  value,
  onValueChange,
  placeholder,
  showClear = value.length > 0,
  onClear,
  wrapperClassName = "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
  inputClassName,
  resultText,
  inputRef: givenRef,
  inputId,
}: SearchInputProps) {
  const ownRef = useRef<HTMLInputElement>(null);
  const inputRef = givenRef ?? ownRef;

  function handleClear() {
    onValueChange?.("");
    onClear?.();
    inputRef.current?.focus();
  }

  const results = resultText ? <div className="text-xs text-muted-foreground">{resultText}</div> : null;

  // Every box clears from inside the field: an × that shows once there is text (admin boxes too, through
  // AdminSearchBox).
  return (
    <div className={wrapperClassName}>
      <div className="relative w-full sm:max-w-md">
        <input
          ref={inputRef}
          id={inputId}
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className={cn(PUBLIC_INPUT, inputClassName)}
        />
        {showClear ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={handleClear}
            className="hm-press absolute right-1.5 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
      {results}
    </div>
  );
}
