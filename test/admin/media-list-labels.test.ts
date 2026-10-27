// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { MediaItem } from "@/app/admin/(protected)/media/list/components/MediaListItem";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("@/lib/client/admin-store", () => ({
  adminWrite: (url: string, init: RequestInit, touches: readonly string[]) => send(url, init, touches),
}));

import { useMediaListLabels } from "@/app/admin/(protected)/media/list/lib/useMediaListLabels";

const VERSION = "2026-10-20T10:00:00.000Z";
const NEWER = "2026-10-21T09:00:00.000Z";

const item: MediaItem = {
  id: "m1",
  type: "image",
  title: "Dune",
  description: null,
  secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/dune.jpg",
  embedUrl: null,
  posterUrl: null,
  categories: ["photography"],
  tags: ["fashion"],
  location: null,
  peopleIds: ["p1"],
  people: ["Sara"],
  event: null,
  year: null,
  nft: null,
  isPublic: true,
  publishAt: null,
  createdAt: null,
  updatedAt: VERSION,
};

const saved = (listItem: Partial<MediaItem>) => ({
  item: { id: "m1", updatedAt: listItem.updatedAt ?? NEWER },
  listItem: { ...item, updatedAt: NEWER, ...listItem },
});

const reply = (status: number, body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status }));

function setup() {
  const replaceItem = vi.fn();
  const setBanner = vi.fn();
  const hook = renderHook(() => useMediaListLabels({ replaceItem, setBanner }));
  return { ...hook, replaceItem, setBanner };
}

const sentBody = (call: number) => JSON.parse(String((send.mock.calls[call]![1] as RequestInit).body));
const sentVersion = (call: number) =>
  ((send.mock.calls[call]![1] as RequestInit).headers as Record<string, string>)["x-hm-expected-version"];

afterEach(() => {
  send.mockReset();
});

describe("useMediaListLabels", () => {
  test("a tag change is a draft until Save, then sent with the version it was opened with", async () => {
    const { result, replaceItem, setBanner } = setup();

    act(() => result.current.open(item, "tags"));
    expect(result.current.draft).toMatchObject({ id: "m1", line: "tags", tags: ["fashion"] });
    expect(result.current.dirty).toBe(false);

    act(() => result.current.addTag("studio"));
    act(() => result.current.addTag("studio"));
    expect(result.current.draft?.tags).toEqual(["fashion", "studio"]);
    expect(result.current.dirty).toBe(true);
    act(() => result.current.removeTag("studio"));
    expect(result.current.dirty).toBe(false);
    act(() => result.current.removeTag("fashion"));

    const back = saved({ tags: [] });
    send.mockReturnValueOnce(reply(200, { ok: true, ...back }));
    await act(() => result.current.save());

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0]![0]).toBe("/api/media/m1/labels");
    expect(sentBody(0)).toEqual({ tags: [] });
    expect(sentVersion(0)).toBe(VERSION);
    expect(send.mock.calls[0]![2]).toEqual(["media", "dashboard", "mediaTags", "pages", "blog"]);
    expect(replaceItem).toHaveBeenCalledWith(back);
    expect(result.current.draft).toBeNull();
    expect(setBanner).toHaveBeenLastCalledWith({ type: "ok", text: "Tags saved." });
  });

  test("a people change sends only the ids", async () => {
    const { result } = setup();
    act(() => result.current.open(item, "people"));
    act(() => result.current.setPeople({ ids: ["p1", "p2"], names: ["Sara", "Ali"] }));

    send.mockReturnValueOnce(reply(200, { ok: true, ...saved({ peopleIds: ["p1", "p2"] }) }));
    await act(() => result.current.save());

    expect(sentBody(0)).toEqual({ peopleIds: ["p1", "p2"] });
  });

  test("dropping only a legacy name counts as a change", () => {
    const { result } = setup();
    act(() => result.current.open({ ...item, people: ["Sara", "Old name"] }, "people"));
    act(() => result.current.setPeople({ ids: ["p1"], names: ["Sara"] }));
    expect(result.current.dirty).toBe(true);
  });

  test("a page using the photo asks; removing from those places sends it again with clearPageUsages", async () => {
    const { result, replaceItem } = setup();
    act(() => result.current.open(item, "people"));
    act(() => result.current.setPeople({ ids: ["p2"], names: ["Ali"] }));

    send
      .mockReturnValueOnce(
        reply(409, { ok: false, code: "MEDIA_IN_USE", error: "In use", items: [{ id: "m1", title: "Dune", usedOn: ["Home — hero photo 1"] }] })
      )
      .mockReturnValueOnce(reply(200, { ok: true, ...saved({ isPublic: false }) }));

    let saving!: Promise<void>;
    act(() => {
      saving = result.current.save();
    });
    await waitFor(() => expect(result.current.usageDialog).not.toBeNull());
    expect(result.current.usageDialog!.options.map((option) => option.label)).toEqual(["Remove from those places and save"]);

    await act(async () => {
      result.current.usageDialog!.answer("remove");
      await saving;
    });

    expect(sentBody(1)).toEqual({ peopleIds: ["p2"], clearPageUsages: true });
    expect(replaceItem).toHaveBeenCalledTimes(1);
    expect(result.current.draft).toBeNull();
  });

  test("cancelling that question keeps the draft open and sends nothing more", async () => {
    const { result, replaceItem } = setup();
    act(() => result.current.open(item, "people"));
    act(() => result.current.setPeople({ ids: [], names: [] }));

    send.mockReturnValueOnce(
      reply(409, { ok: false, code: "MEDIA_IN_USE", error: "In use", items: [{ id: "m1", title: "Dune", usedOn: ["Home"] }] })
    );

    let saving!: Promise<void>;
    act(() => {
      saving = result.current.save();
    });
    await waitFor(() => expect(result.current.usageDialog).not.toBeNull());
    await act(async () => {
      result.current.usageDialog!.answer("cancel");
      await saving;
    });

    expect(send).toHaveBeenCalledTimes(1);
    expect(replaceItem).not.toHaveBeenCalled();
    expect(result.current.draft).toMatchObject({ peopleIds: [] });
    expect(result.current.busy).toBe(false);
  });

  test("changed on another device: Load the newer version shows it and closes the line", async () => {
    const { result, replaceItem } = setup();
    act(() => result.current.open(item, "tags"));
    act(() => result.current.addTag("studio"));

    const current = saved({ tags: ["gel"] });
    send.mockReturnValueOnce(reply(409, { ok: false, code: "RECORD_CHANGED", error: "Changed", current }));

    let saving!: Promise<void>;
    act(() => {
      saving = result.current.save();
    });
    await waitFor(() => expect(result.current.changedDialog).not.toBeNull());
    await act(async () => {
      result.current.changedDialog!.answer("reload");
      await saving;
    });

    expect(send).toHaveBeenCalledTimes(1);
    expect(replaceItem).toHaveBeenCalledWith(current);
    expect(result.current.draft).toBeNull();
  });

  test("changed on another device: Save mine over it sends again with the newer version", async () => {
    const { result } = setup();
    act(() => result.current.open(item, "tags"));
    act(() => result.current.addTag("studio"));

    send
      .mockReturnValueOnce(reply(409, { ok: false, code: "RECORD_CHANGED", error: "Changed", current: saved({ tags: ["gel"] }) }))
      .mockReturnValueOnce(reply(200, { ok: true, ...saved({ tags: ["fashion", "studio"] }) }));

    let saving!: Promise<void>;
    act(() => {
      saving = result.current.save();
    });
    await waitFor(() => expect(result.current.changedDialog).not.toBeNull());
    await act(async () => {
      result.current.changedDialog!.answer("overwrite");
      await saving;
    });

    expect(sentVersion(1)).toBe(NEWER);
    expect(sentBody(1)).toEqual({ tags: ["fashion", "studio"] });
    expect(result.current.draft).toBeNull();
  });

  test("a refused save names the server's reason and keeps the draft", async () => {
    const { result, setBanner } = setup();
    act(() => result.current.open(item, "tags"));
    act(() => result.current.addTag("ghost"));

    send.mockReturnValueOnce(reply(400, { ok: false, error: "“ghost” is not in Tags." }));
    await act(() => result.current.save());

    expect(setBanner).toHaveBeenLastCalledWith({ type: "err", text: "Tags not saved: “ghost” is not in Tags." });
    expect(result.current.draft?.tags).toEqual(["fashion", "ghost"]);
  });

  test("a file that could not be made private is reported after the save", async () => {
    const { result, setBanner } = setup();
    act(() => result.current.open(item, "people"));
    act(() => result.current.setPeople({ ids: ["p2"], names: ["Ali"] }));

    send.mockReturnValueOnce(reply(200, { ok: true, ...saved({}), deliveryError: "“Dune” is hidden, but … Save again to retry." }));
    await act(() => result.current.save());

    expect(setBanner).toHaveBeenLastCalledWith({
      type: "err",
      text: "People saved. “Dune” is hidden, but … Save again to retry.",
    });
  });
});
