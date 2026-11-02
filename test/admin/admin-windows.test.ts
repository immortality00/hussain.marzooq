// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => createElement("img", { src, alt }),
}));
vi.mock("@/components/shared/upload/CloudinaryUploadButton", () => ({ CloudinaryUploadButton: () => null }));
vi.mock("@/lib/client/cleanup-uploaded-asset", () => ({ cleanupUploadedAsset: vi.fn() }));
vi.mock("@/components/admin/private-galleries/usePrivateGalleryMediaPicker", () => ({
  usePrivateGalleryMediaPicker: () => ({
    items: [],
    loading: false,
    loadingMore: false,
    error: null,
    nextCursor: null,
    searchValue: "",
    setSearchValue: () => undefined,
    clearSearch: () => undefined,
    loadMore: () => undefined,
  }),
}));

import { MediaPickerModal } from "@/components/admin/media-picker/MediaPickerModal";
import { TestimonialInspectModal } from "@/app/admin/(protected)/testimonials/components/TestimonialInspectModal";
import ServiceEditorModal from "@/app/admin/(protected)/services/components/ServiceEditorModal";
import type { Service, ServiceCategory } from "@/app/admin/(protected)/services/lib/types";
import type { TestimonialItem } from "@/app/admin/(protected)/testimonials/components/TestimonialShared";

const REVIEW: TestimonialItem = {
  id: "r1",
  name: "Sara",
  email: null,
  about: null,
  location: "Dubai",
  review: "Lovely shoot.",
  rating: 5,
  profilePhotoUrl: null,
  photoUrls: [],
  isApproved: false,
  sortOrder: 0,
  createdAt: null,
  updatedAt: null,
};

const CATEGORIES: ServiceCategory[] = [
  { id: "c1", name: "Photography", slug: "photography", isActive: true, order: 0 },
  { id: "c2", name: "Others", slug: "others", isActive: true, order: 1 },
];

const SERVICE: Service = {
  id: "s1",
  name: "Editorial",
  slug: "editorial",
  category: "photography",
  categoryId: "c1",
  description: "",
  startingPrice: 1000,
  currency: "AED",
  imageUrl: "",
  isActive: true,
  isArchived: false,
  order: 0,
  inquiriesCount: 0,
  updatedAt: null,
};

const escape = () => fireEvent.keyDown(window, { key: "Escape" });
const scrollLocked = () => document.documentElement.style.overflow === "hidden";

function focusedOpener() {
  const button = document.createElement("button");
  document.body.appendChild(button);
  button.focus();
  return button;
}

function serviceEditor(props: Partial<Parameters<typeof ServiceEditorModal>[0]> = {}) {
  return createElement(ServiceEditorModal, {
    open: true,
    initial: SERVICE,
    categories: CATEGORIES,
    onClose: () => undefined,
    onSave: async () => undefined,
    ...props,
  });
}

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("media picker window", () => {
  test("is a named dialog on <body> that takes focus and gives it back", () => {
    const opener = focusedOpener();
    const { container, unmount } = render(createElement(MediaPickerModal, { onPick: vi.fn(), onClose: vi.fn() }));

    const dialog = screen.getByRole("dialog", { name: "Choose an image" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(container.contains(dialog)).toBe(false);
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(scrollLocked()).toBe(true);

    unmount();
    expect(document.activeElement).toBe(opener);
    expect(scrollLocked()).toBe(false);
  });

  test("Escape and a tap outside close it; a tap inside does not", () => {
    const onClose = vi.fn();
    render(createElement(MediaPickerModal, { onPick: vi.fn(), onClose }));

    fireEvent.click(screen.getByText("Pick from media library"));
    expect(onClose).not.toHaveBeenCalled();

    escape();
    fireEvent.click(screen.getByRole("dialog", { name: "Choose an image" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe("testimonial window", () => {
  const inspect = (onClose: () => void) =>
    createElement(TestimonialInspectModal, {
      item: REVIEW,
      updating: false,
      deleting: false,
      onSetApproval: vi.fn(),
      onDelete: vi.fn(),
      onClose,
    });

  test("opens on Close, not Approve, and gives focus back", () => {
    const opener = focusedOpener();
    const { unmount } = render(inspect(vi.fn()));

    const dialog = screen.getByRole("dialog", { name: "Review by Sara" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close" }));
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(scrollLocked()).toBe(true);

    unmount();
    expect(document.activeElement).toBe(opener);
    expect(scrollLocked()).toBe(false);
  });

  test("Escape and a tap outside close it; a tap inside does not", () => {
    const onClose = vi.fn();
    render(inspect(onClose));

    fireEvent.click(screen.getByText("Lovely shoot.", { exact: false }));
    expect(onClose).not.toHaveBeenCalled();

    escape();
    fireEvent.click(screen.getByRole("dialog", { name: "Review by Sara" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe("service editor window", () => {
  test("is a named dialog that takes focus, and closing it releases the page", () => {
    const opener = focusedOpener();
    const { rerender } = render(serviceEditor());

    const dialog = screen.getByRole("dialog", { name: "Edit Service" });
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(scrollLocked()).toBe(true);

    rerender(serviceEditor({ open: false }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
    expect(scrollLocked()).toBe(false);
  });

  test("names a new service's window Create Service", () => {
    render(serviceEditor({ initial: null }));
    expect(screen.getByRole("dialog", { name: "Create Service" })).toBeTruthy();
  });

  test("with nothing changed, Escape and a tap outside close at once", () => {
    const onClose = vi.fn();
    render(serviceEditor({ onClose }));

    fireEvent.click(screen.getByText("Description"));
    expect(onClose).not.toHaveBeenCalled();

    escape();
    fireEvent.click(screen.getByRole("dialog", { name: "Edit Service" }));
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("dialog", { name: "Discard your changes?" })).toBeNull();
  });

  test("with a change, Escape asks first; Keep editing keeps it, and Escape on the question answers only the question", async () => {
    const onClose = vi.fn();
    render(serviceEditor({ onClose }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Changed" } });

    escape();
    await screen.findByRole("dialog", { name: "Discard your changes?" });
    expect(onClose).not.toHaveBeenCalled();

    escape();
    expect(screen.queryByRole("dialog", { name: "Discard your changes?" })).toBeNull();
    expect(onClose).not.toHaveBeenCalled();

    escape();
    const question = await screen.findByRole("dialog", { name: "Discard your changes?" });
    fireEvent.click(within(question).getByRole("button", { name: "Keep editing" }));
    expect(screen.queryByRole("dialog", { name: "Discard your changes?" })).toBeNull();
    expect((screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement).value).toBe("Changed");
    expect(onClose).not.toHaveBeenCalled();
  });

  test("with a change, a tap outside asks, and Discard closes the window", async () => {
    const onClose = vi.fn();
    render(serviceEditor({ onClose }));
    fireEvent.change(screen.getByRole("textbox", { name: "Slug" }), { target: { value: "other" } });

    fireEvent.click(screen.getByRole("dialog", { name: "Edit Service" }));
    await screen.findByRole("dialog", { name: "Discard your changes?" });
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("changing a field back to what it was counts as no change", () => {
    const onClose = vi.fn();
    render(serviceEditor({ onClose }));
    const name = screen.getByRole("textbox", { name: "Name" });
    fireEvent.change(name, { target: { value: "Changed" } });
    fireEvent.change(name, { target: { value: "Editorial" } });

    escape();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("while saving, Escape and a tap outside do nothing", () => {
    const onClose = vi.fn();
    render(serviceEditor({ onClose, onSave: () => new Promise<void>(() => undefined) }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Changed" } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    escape();
    fireEvent.click(screen.getByRole("dialog", { name: "Edit Service" }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog", { name: "Discard your changes?" })).toBeNull();
  });
});
