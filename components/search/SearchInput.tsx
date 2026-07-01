"use client";

type SearchInputProps = {
  value: string;
  onValueChange?: (value: string) => void;
  placeholder: string;
  showClear?: boolean;
  onClear?: () => void;
  wrapperClassName?: string;
  inputClassName?: string;
  clearButtonClassName?: string;
  resultText?: string;
};

export function SearchInput({
  value,
  onValueChange,
  placeholder,
  showClear = value.trim().length > 0,
  onClear,
  wrapperClassName = "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
  inputClassName = "w-full rounded-2xl border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring sm:max-w-md",
  clearButtonClassName = "rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-accent",
  resultText,
}: SearchInputProps) {
  const updateValue = onValueChange;

  function handleClear() {
    updateValue?.("");
    onClear?.();
  }

  return (
    <div className={wrapperClassName}>
      <input
        value={value}
        onChange={(event) => updateValue?.(event.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />

      {resultText ? <div className="text-xs text-muted-foreground">{resultText}</div> : null}

      {showClear ? (
        <button type="button" onClick={handleClear} className={clearButtonClassName}>
          Clear
        </button>
      ) : null}
    </div>
  );
}