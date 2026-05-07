"use client";

import type { ServiceItem, ServiceMode } from "./types";

export default function ContactServiceSelector({
  services,
  serviceMode,
  setModeSelect,
  setModeOther,
  selectedServiceId,
  onSelectService,
  otherService,
  setOtherService,
}: {
  services: ServiceItem[];
  serviceMode: ServiceMode;
  setModeSelect: () => void;
  setModeOther: () => void;
  selectedServiceId: string;
  onSelectService: (id: string) => void;
  otherService: string;
  setOtherService: (value: string) => void;
}) {
  return (
    <div className="space-y-2 sm:col-span-2">
      <label className="text-sm font-medium">Service</label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={setModeSelect}
          className={`rounded-full border px-3 py-1.5 text-sm ${
            serviceMode === "select" ? "bg-accent" : "hover:bg-accent/40"
          }`}
        >
          Choose from list
        </button>
        <button
          type="button"
          onClick={setModeOther}
          className={`rounded-full border px-3 py-1.5 text-sm ${
            serviceMode === "other" ? "bg-accent" : "hover:bg-accent/40"
          }`}
        >
          Other (specify)
        </button>
      </div>

      {serviceMode === "select" ? (
        <select
          value={selectedServiceId}
          onChange={(e) => onSelectService(e.target.value)}
          className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select…</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.startingPrice !== null ? ` — from ${s.currency} ${s.startingPrice}` : ""}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={otherService}
          onChange={(e) => setOtherService(e.target.value)}
          className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Describe what you need"
        />
      )}
    </div>
  );
}