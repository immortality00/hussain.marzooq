// @vitest-environment jsdom
import { createElement, type ComponentType, type ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/" }));
vi.mock("@/lib/reduced-motion", () => ({ prefersReducedMotion: () => false }));

import { TransitionProvider } from "@/components/transitions/TransitionContext";

const AVATAR = "https://res.cloudinary.com/demo/image/upload/hm_visuals/people/avatar.jpg";
const PHOTOS = [
  "https://res.cloudinary.com/demo/image/upload/w_400/hm_visuals/media/photography/a.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_400/hm_visuals/media/photography/b.jpg",
];

function renderPage(images: string[]) {
  const view = render(
    createElement(
      TransitionProvider as ComponentType<{ images: string[]; children?: ReactNode }>,
      { images },
      createElement(
        "main",
        null,
        createElement("img", { src: AVATAR, alt: "Profile" }),
        createElement("a", { href: "/people" }, "People")
      )
    )
  );
  fireEvent.click(screen.getByText("People"));
  return view.container;
}

function cellImages(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(".hm-cell")).map(
    (cell) => cell.style.backgroundImage
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("the page transition only ever shows media-library photos", () => {
  test("with no library photos it navigates plainly instead of borrowing the page's images", () => {
    const container = renderPage([]);

    expect(push).toHaveBeenCalledWith("/people");
    expect(container.querySelector(".hm-transition-overlay")).toBeNull();
  });

  test("with library photos every cell comes from the library, never from the page", () => {
    const container = renderPage(PHOTOS);
    const images = cellImages(container);

    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(PHOTOS.some((photo) => image.includes(photo))).toBe(true);
      expect(image).not.toContain("avatar");
    }
  });

  test("a single library photo plays the quick fade, not a grid of one image", () => {
    const container = renderPage(PHOTOS.slice(0, 1));

    expect(container.querySelector(".hm-transition-reduced")).not.toBeNull();
    expect(cellImages(container)).toEqual([]);
  });
});
