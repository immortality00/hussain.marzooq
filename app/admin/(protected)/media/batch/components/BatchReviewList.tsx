"use client";

import { adminButtonClasses } from "@/components/admin/AdminButton";
import type { BatchItem } from "../lib/useBatchMediaState";
import { BatchItemThumb } from "./BatchItemThumb";
import { adminInputClasses } from "@/components/admin/admin-input";

export function BatchReviewList({
  items,
  updateItem,
  removeItem,
}: {
  items: BatchItem[];
  updateItem: (id: string, patch: Partial<Pick<BatchItem, "title" | "description">>) => void;
  removeItem: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3 rounded-2xl border p-3">
          <BatchItemThumb item={item} compact />
          <div className="flex-1 space-y-2">
            <input
              value={item.title}
              onChange={(e) => updateItem(item.id, { title: e.target.value })}
              placeholder="Title"
              aria-invalid={!item.title.trim() ? true : undefined}
              className={adminInputClasses()}
            />
            <textarea
              value={item.description}
              onChange={(e) => updateItem(item.id, { description: e.target.value })}
              placeholder="Description (optional)"
              className={adminInputClasses("md", "h-16")}
            />
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className={adminButtonClasses("danger", "sm")}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
