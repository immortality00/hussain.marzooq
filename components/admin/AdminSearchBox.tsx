"use client";

import { SearchInput } from "@/components/search/SearchInput";
import { adminInputClasses } from "@/components/admin/admin-input";

// Every admin search field: the admin input look with the clear × inside the field (as on the public site).
// The words reach the search 500 ms after the last keystroke — the caller holds them with useDebouncedText
// or useDebouncedSearch and passes their `clear` as `onClear`, so clearing applies at once.
export function AdminSearchBox({
  value,
  onValueChange,
  onClear,
  placeholder,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <SearchInput
      value={value}
      onValueChange={onValueChange}
      onClear={onClear}
      placeholder={placeholder}
      wrapperClassName={className}
      inputClassName={adminInputClasses("md", "pr-11")}
    />
  );
}
