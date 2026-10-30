import { describe, expect, test } from "vitest";
import { addedItemsContent, buildMediaDraft, mdText, type DraftMedia } from "@/lib/media-draft";

const PHOTO = "https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/media/photography/a.jpg";
const PHOTO_B = "https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/media/photography/b.jpg";

function item(over: Partial<DraftMedia> = {}): DraftMedia {
  return {
    id: "a",
    kind: "image",
    title: "Gold Hour",
    description: "",
    event: "",
    location: "",
    year: null,
    imageUrl: PHOTO,
    watchUrl: "",
    people: [],
    tags: [],
    appearances: [],
    nft: null,
    ...over,
  };
}

describe("buildMediaDraft — one item", () => {
  test("every field present: wording, order, links", () => {
    const draft = buildMediaDraft([
      item({
        description: "Shot in one take. The light held.",
        event: "Fashion Week",
        location: "Dubai, United Arab Emirates",
        year: 2026,
        people: [{ name: "Lina", slug: "lina" }],
        tags: [{ label: "Fashion", href: "/photography/fashion" }],
        appearances: [
          {
            kind: "exhibited",
            title: "Light Lines",
            venue: "Gallery One",
            city: "Paris",
            country: "France",
            dateFrom: "2026-03",
            dateTo: "2026-05",
            link: "https://gallery.example/light",
          },
          { kind: "featured", title: "Vogue Arabia", venue: "", city: "", country: "", dateFrom: "2026-04", dateTo: "", link: "" },
        ],
      }),
    ]);

    expect(draft.title).toBe("Gold Hour");
    expect(draft.excerpt).toBe("Shot in one take.");
    expect(draft.coverImageUrl).toBe(PHOTO);
    expect(draft.tags).toEqual(["Fashion"]);
    expect(draft.content).toBe(
      [
        "Shot in one take. The light held.",
        "Fashion Week — Dubai, United Arab Emirates, 2026.",
        "**With** [Lina](/people/lina)",
        "**Exhibited**\n\n- [Light Lines](https://gallery.example/light) — Gallery One, Paris, France · March 2026 – May 2026",
        "**Featured**\n\n- Vogue Arabia · April 2026",
        "[More Fashion](/photography/fashion)",
      ].join("\n\n")
    );
  });

  test("the photo is the cover, so the text doesn't repeat it", () => {
    expect(buildMediaDraft([item()]).content).not.toContain(PHOTO);
  });

  test("empty fields are left out, never filled in", () => {
    const draft = buildMediaDraft([item()]);
    expect(draft).toEqual({ title: "Gold Hour", excerpt: "", content: "", coverImageUrl: PHOTO, tags: [] });
  });

  test("with no description the excerpt is the place line", () => {
    expect(buildMediaDraft([item({ location: "Dubai", year: 2025 })]).excerpt).toBe("Dubai, 2025.");
    expect(buildMediaDraft([item({ event: "Opening night" })]).excerpt).toBe("Opening night.");
  });

  test("a long first sentence is cut at a word", () => {
    const excerpt = buildMediaDraft([item({ description: `${"word ".repeat(80)}end.` })]).excerpt;
    expect(excerpt.length).toBeLessThanOrEqual(201);
    expect(excerpt.endsWith("word…")).toBe(true);
  });

  test("a video link: its thumbnail is the cover and the text links to the film", () => {
    const draft = buildMediaDraft([
      item({ kind: "embed", imageUrl: PHOTO_B, watchUrl: "https://www.youtube.com/watch?v=abcdefghijk" }),
    ]);
    expect(draft.coverImageUrl).toBe(PHOTO_B);
    expect(draft.content).toBe("[Watch the film](https://www.youtube.com/watch?v=abcdefghijk)");
  });

  test("a video link with no thumbnail has no cover", () => {
    expect(buildMediaDraft([item({ kind: "embed", imageUrl: "", watchUrl: "/videography" })]).coverImageUrl).toBe("");
  });

  test("an NFT shows its edition, price by code and status, then the collection", () => {
    const nft = (over: Partial<NonNullable<DraftMedia["nft"]>>) =>
      buildMediaDraft([
        item({ nft: { editionType: "1/1", editionsTotal: 1, price: 0.5, currency: "ETH", status: "available", ...over } }),
      ]).content;
    expect(nft({})).toBe("1 of 1 · 0.5 ETH\n\n[View the collection](/nft)");
    expect(nft({ editionType: "limited", editionsTotal: 25, status: "sold", currency: "XTZ", price: 40 })).toContain(
      "Edition of 25 · 40 XTZ · Sold"
    );
    expect(nft({ editionType: "open", price: null, status: "coming-soon" })).toContain("Open edition · Coming soon");
  });

  test("a tag with no page gives no link but stays a post tag", () => {
    const draft = buildMediaDraft([item({ tags: [{ label: "Art", href: null }] })]);
    expect(draft.content).toBe("");
    expect(draft.tags).toEqual(["Art"]);
  });
});

describe("buildMediaDraft — a batch", () => {
  const batch = [
    item({ id: "a", title: "One", description: "First frame.", event: "Fashion Week", location: "Dubai", year: 2026 }),
    item({ id: "b", title: "Two", imageUrl: PHOTO_B, event: "Fashion Week", location: "Dubai", year: 2026 }),
  ];

  test("titled by the event, every photo after the cover in the text with its caption", () => {
    const draft = buildMediaDraft(batch);
    expect(draft.title).toBe("Fashion Week");
    expect(draft.excerpt).toBe("2 frames from Fashion Week — Dubai, 2026.");
    expect(draft.coverImageUrl).toBe(PHOTO);
    expect(draft.content).toBe(
      ["*One*", "First frame.", `![Two](${PHOTO_B})`, "*Two*", "Fashion Week — Dubai, 2026."].join("\n\n")
    );
  });

  test("no event: the first title, and the excerpt without “from”", () => {
    const draft = buildMediaDraft(batch.map((entry) => ({ ...entry, event: "" })));
    expect(draft.title).toBe("One");
    expect(draft.excerpt).toBe("2 frames — Dubai, 2026.");
  });

  test("people and exhibitions shared by the batch are listed once", () => {
    const lina = { name: "Lina", slug: "lina" };
    const draft = buildMediaDraft(batch.map((entry) => ({ ...entry, people: [lina] })));
    expect(draft.content.match(/Lina/g)).toHaveLength(1);
  });

  test("items added to an edited draft: each one's picture and text", () => {
    expect(addedItemsContent([batch[1]!])).toBe(`![Two](${PHOTO_B})\n\n*Two*`);
  });
});

describe("mdText", () => {
  test("what markdown would read as formatting shows as typed", () => {
    expect(mdText("a *b* _c_ [d](e) <f> `g` ~h~ |i|")).toBe("a \\*b\\* \\_c\\_ \\[d\\](e) \\<f\\> \\`g\\` \\~h\\~ \\|i\\|");
    expect(mdText("# not a heading\n- not a list\n1. not a list")).toBe(
      "\\# not a heading\n\\- not a list\n1\\. not a list"
    );
    expect(mdText("Dubai — 2026. Plain text stays plain.")).toBe("Dubai — 2026. Plain text stays plain.");
  });
});
