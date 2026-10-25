// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import TagsTable from "@/app/admin/(protected)/tags/components/TagsTable";
import type { Tag } from "@/app/admin/(protected)/tags/lib/types";

afterEach(cleanup);

const tag = (label: string, slug: string): Tag => ({
  id: slug,
  label,
  slug,
  description: "",
  isActive: true,
  order: 0,
  mediaCount: 0,
});

describe("TagsTable", () => {
  it("renders a tag whose label equals its slug without a duplicate-key warning", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(
      createElement(TagsTable, {
        ordered: [tag("shows", "shows"), tag("Fine Art", "fine-art")],
        isSelected: () => false,
        onToggleSelect: () => {},
        onReorder: () => {},
        onEdit: async () => true,
        onToggle: () => {},
        onDelete: () => {},
      }),
    );

    const messages = error.mock.calls.map((call) => call.map(String).join(" "));
    error.mockRestore();

    expect(messages.filter((m) => m.includes("same key"))).toEqual([]);
    expect(container.querySelectorAll('input[placeholder="Label"]')[0]).toHaveProperty("value", "shows");
    expect(container.querySelectorAll('input[placeholder="slug"]')[0]).toHaveProperty("value", "shows");
  });
});
