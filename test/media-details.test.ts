// @vitest-environment jsdom
import { createElement, type ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

let pathname = "/photography";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => createElement("a", { href, ...rest }, children),
}));

import MediaDetailsSections from "@/components/media/MediaDetailsSections";
import type { Appearance, MediaItem, TagLinks } from "@/components/media/types";
import { appearanceLines, mediaMetaLine, popupImageOf } from "@/components/media/utils";

afterEach(() => {
  cleanup();
  pathname = "/photography";
});

function item(overrides: Partial<MediaItem> = {}): MediaItem {
  return {
    id: "m1",
    type: "image",
    title: "Frame",
    description: null,
    location: "Dubai",
    event: "Fashion Week",
    year: 2026,
    tags: [],
    categories: ["photography"],
    people: [],
    appearances: [],
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/a.jpg",
    embedUrl: null,
    posterUrl: null,
    createdAt: null,
    ...overrides,
  };
}

function appearance(overrides: Partial<Appearance>): Appearance {
  return {
    kind: "exhibited",
    title: "",
    venue: "",
    city: "",
    country: "",
    dateFrom: "",
    dateTo: "",
    notes: "",
    link: "",
    locationId: "",
    lat: null,
    lon: null,
    ...overrides,
  } as Appearance;
}

const TAG_LINKS: TagLinks = {
  photography: { fashion: { label: "Fashion", href: "/photography/fashion" } },
  videography: { fashion: { label: "Fashion", href: "/videography/fashion" } },
};

describe("the popup's details", () => {
  test("link each person to their public profile, and leave the rest as names", () => {
    render(
      createElement(MediaDetailsSections, {
        active: item({ people: [{ name: "Ana", slug: "ana" }, { name: "Bo", slug: null }] }),
      })
    );

    expect(screen.getByRole("link", { name: "Ana" }).getAttribute("href")).toBe("/people/ana");
    expect(screen.queryByRole("link", { name: "Bo" })).toBeNull();
    expect(screen.getByText("Bo")).toBeTruthy();
  });

  test("leave the person's name plain on their own page", () => {
    pathname = "/people/ana";
    render(createElement(MediaDetailsSections, { active: item({ people: [{ name: "Ana", slug: "ana" }] }) }));
    expect(screen.queryByRole("link", { name: "Ana" })).toBeNull();
    expect(screen.getByText("Ana")).toBeTruthy();
  });

  test("list the year, place and event once, as labelled details, and never the internal categories", () => {
    render(createElement(MediaDetailsSections, { active: item() }));
    expect(screen.getByText("Details")).toBeTruthy();
    expect(screen.getByText("Year").nextElementSibling?.textContent).toBe("2026");
    expect(screen.getByText("Location").nextElementSibling?.textContent).toBe("Dubai");
    expect(screen.getByText("Event").nextElementSibling?.textContent).toBe("Fashion Week");
    expect(screen.queryByText("Categories")).toBeNull();
    expect(screen.queryByText("photography")).toBeNull();
  });

  test("draw no Details box, and no empty row, when there is nothing to list", () => {
    const { container } = render(
      createElement(MediaDetailsSections, { active: item({ year: null, location: null, event: "" }) })
    );
    expect(container.textContent).toBe("");
    cleanup();

    render(createElement(MediaDetailsSections, { active: item({ location: null }) }));
    expect(screen.queryByText("Location")).toBeNull();
    expect(screen.getByText("Year")).toBeTruthy();
  });

  test("show tags by name, opening the page for the item's discipline; a tag with no page isn't shown", () => {
    render(createElement(MediaDetailsSections, { active: item({ tags: ["fashion", "switched-off"] }), tagLinks: TAG_LINKS }));
    expect(screen.getByRole("link", { name: "Fashion" }).getAttribute("href")).toBe("/photography/fashion");
    expect(screen.queryByText("switched-off")).toBeNull();
    cleanup();

    render(createElement(MediaDetailsSections, { active: item({ type: "embed", tags: ["fashion"] }), tagLinks: TAG_LINKS }));
    expect(screen.getByRole("link", { name: "Fashion" }).getAttribute("href")).toBe("/videography/fashion");
    cleanup();

    render(createElement(MediaDetailsSections, { active: item({ tags: ["fashion"] }) }));
    expect(screen.queryByText("Tags")).toBeNull();
  });

  test("list exhibitions and features in boxes of their own, each only when it has entries", () => {
    render(
      createElement(MediaDetailsSections, {
        active: item({
          appearances: [appearance({ title: "Light Show", venue: "Alserkal", city: "Dubai", country: "United Arab Emirates" })],
        }),
      })
    );
    expect(screen.getByText("Exhibited")).toBeTruthy();
    expect(screen.queryByText("Featured")).toBeNull();
    expect(screen.queryByText("Exhibitions / Featured")).toBeNull();
    expect(screen.getByText("Alserkal • Dubai • United Arab Emirates")).toBeTruthy();
  });
});

describe("popup lines", () => {
  test("an appearance saved without a title is headed by its venue, not repeated below", () => {
    expect(appearanceLines(appearance({ venue: "Alserkal", city: "Dubai", country: "UAE" }))).toEqual({
      heading: "Alserkal",
      place: "Dubai • UAE",
    });
    expect(appearanceLines(appearance({ title: "Show", city: "Dubai" }))).toEqual({ heading: "Show", place: "Dubai" });
    expect(appearanceLines(appearance({}))).toEqual({ heading: "", place: "" });
  });

  test("a card's line under its title is empty when nothing is set", () => {
    expect(mediaMetaLine(item())).toBe("2026 • Dubai • Fashion Week");
    expect(mediaMetaLine(item({ year: null, location: null, event: null }))).toBe("");
  });

  test("a popup opens on the photo, or a video link's poster; an uploaded video has no picture", () => {
    expect(popupImageOf(item())).toContain("a.jpg");
    expect(popupImageOf(item({ type: "embed", embedUrl: "https://www.youtube-nocookie.com/embed/x", posterUrl: "p.jpg" }))).toBe("p.jpg");
    expect(popupImageOf(item({ type: "video" }))).toBeNull();
  });
});
