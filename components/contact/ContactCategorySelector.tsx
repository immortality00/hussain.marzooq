"use client";

import { useId } from "react";

import type { CategoryMode, ServiceItem, ServiceMode } from "./types";

export default function ContactCategorySelector({
  serviceMode,
  selectedService,
  categoryMode,
  setCategoryMode,
  selectedCategory,
  setSelectedCategory,
  otherCategory,
  setOtherCategory,
  categories,
}: {
  serviceMode: ServiceMode;
  selectedService: ServiceItem | null;
  categoryMode: CategoryMode;
  setCategoryMode: (value: CategoryMode) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  otherCategory: string;
  setOtherCategory: (value: string) => void;
  categories: string[];
}) {
  const fieldId = useId();

  return (
    <div className="space-y-2 sm:col-span-2">
      {serviceMode === "select" ? (
        <div className="text-sm font-medium">Category</div>
      ) : (
        <label htmlFor={fieldId} className="text-sm font-medium">
          Category
        </label>
      )}

      {serviceMode === "select" ? (
        <div className="rounded-xl border bg-muted px-3 py-2 text-sm text-muted-foreground">
          {selectedService?.category || "Select a service to auto-fill category"}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryMode("select")}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                categoryMode === "select" ? "bg-accent" : "hover:bg-accent/40"
              }`}
            >
              Choose category
            </button>
            <button
              type="button"
              onClick={() => setCategoryMode("other")}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                categoryMode === "other" ? "bg-accent" : "hover:bg-accent/40"
              }`}
            >
              Other category
            </button>
          </div>

          {categoryMode === "select" ? (
            <select
              id={fieldId}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={fieldId}
              value={otherCategory}
              onChange={(e) => setOtherCategory(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Type a category"
            />
          )}
        </>
      )}
    </div>
  );
}