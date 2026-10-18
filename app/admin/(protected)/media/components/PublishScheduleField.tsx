"use client";

import { adminInputClasses } from "@/components/admin/admin-input";
import { publishScheduleError, type PublishSchedule } from "@/lib/media-schedule";

const OPTIONS = [
  { scheduled: false, label: "Now" },
  { scheduled: true, label: "Schedule" },
] as const;

export function PublishScheduleField({
  value,
  onChange,
  label = "Publish",
}: {
  value: PublishSchedule;
  onChange: (next: PublishSchedule) => void;
  label?: string;
}) {
  const invalid = value.scheduled && Boolean(publishScheduleError(value));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{label}</span>
        <div role="radiogroup" aria-label={label} className="flex gap-1">
          {OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={value.scheduled === option.scheduled}
              onClick={() => onChange({ ...value, scheduled: option.scheduled })}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                value.scheduled === option.scheduled ? "bg-accent" : "hover:bg-accent/40"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {value.scheduled ? (
        <input
          type="datetime-local"
          aria-label="Publish date and time"
          value={value.local}
          aria-invalid={invalid ? true : undefined}
          onChange={(event) => onChange({ scheduled: true, local: event.target.value })}
          className={adminInputClasses("md", "w-auto")}
        />
      ) : null}
    </div>
  );
}
