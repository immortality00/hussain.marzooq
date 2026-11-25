"use client";

import { useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { Search } from "lucide-react";
import { SearchInput } from "@/components/search/SearchInput";

// The longest a fold waits for the click of the press that took the focus away.
const FOLD_WAIT_MS = 400;

// A search box at the end of a row of chips. From 768px it is a plain 16rem box.
// Below that it folds to a search icon; a tap opens it to half the row (the chips make room)
// with the cursor in it, and it folds again when left empty. While it holds a search it stays
// open. With nothing beside it (`collapsible` false) it fills the row instead. Sizes and motion:
// app/styles/forms.css (.hm-expanding-search).
export function ExpandingSearch({
  value,
  onValueChange,
  onClear,
  placeholder,
  collapsible = true,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  collapsible?: boolean;
}) {
  const [opened, setOpened] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);
  const inputId = useId();
  const open = !collapsible || opened || value.length > 0;

  // flushSync: the box must be on screen before focus() inside the tap, or iOS opens no keyboard.
  function openBox() {
    flushSync(() => setOpened(true));
    inputRef.current?.focus();
  }

  // A press elsewhere takes the focus on press; folding then would slide the chips under the
  // finger and its click could land on another chip. So the fold waits for that click (or, when
  // the focus left by keyboard, a moment).
  function foldAfterPress() {
    let done = false;
    const fold = () => {
      if (done) return;
      done = true;
      window.removeEventListener("click", fold);
      window.clearTimeout(timer);
      setOpened(false);
    };
    window.addEventListener("click", fold);
    const timer = window.setTimeout(fold, FOLD_WAIT_MS);
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    if (collapsible && !value) foldAfterPress();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape" || value || !collapsible) return;
    flushSync(() => setOpened(false));
    iconRef.current?.focus();
  }

  return (
    <div
      data-open={open || undefined}
      data-fill={!collapsible || undefined}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      className="hm-expanding-search shrink-0"
    >
      {open ? null : (
        <button
          ref={iconRef}
          type="button"
          aria-label="Search"
          aria-expanded={false}
          aria-controls={inputId}
          onClick={openBox}
          className="hm-press hm-press-quick inline-flex size-[2.625rem] items-center justify-center rounded-2xl border bg-background text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:hidden"
        >
          <Search className="size-4" aria-hidden />
        </button>
      )}
      <SearchInput
        value={value}
        onValueChange={onValueChange}
        onClear={onClear}
        placeholder={placeholder}
        inputRef={inputRef}
        inputId={inputId}
        wrapperClassName={open ? "w-full" : "hidden w-full md:block"}
      />
    </div>
  );
}
