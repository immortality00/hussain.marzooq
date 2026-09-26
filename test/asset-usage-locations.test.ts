import { describe, expect, test } from "vitest";
import { mentionsPublicId, usagesInDocs, type UsageSourceDocs } from "@/lib/asset-usage-locations";
import { editedValue, editMarkdown } from "@/lib/asset-usage-edits";
import { MEDIA_IN_USE, formatMediaInUseError, parseMediaUsageChoice, readMediaInUse } from "@/lib/media-in-use";

const ID = "hm_visuals/media/photography/abc123";
const URL = `https://res.cloudinary.com/demo/image/upload/v17/${ID}.jpg`;
const OTHER = "https://res.cloudinary.com/demo/image/upload/v17/hm_visuals/media/photography/zzz.jpg";

function docs(partial: Partial<UsageSourceDocs>): UsageSourceDocs {
  return { sections: [], settings: [], seo: [], posts: [], ...partial };
}

const image = (url: string) => ({ url, publicId: "" });

describe("mentionsPublicId", () => {
  test("matches the file inside a delivery URL", () => {
    expect(mentionsPublicId(URL, ID)).toBe(true);
    expect(mentionsPublicId(`${URL}?x=1`, ID)).toBe(true);
  });

  test("never matches a longer id that starts with the same characters", () => {
    expect(mentionsPublicId(URL.replace("abc123", "abc1234"), ID)).toBe(false);
  });

  test("ignores non-strings and empty ids", () => {
    expect(mentionsPublicId(null, ID)).toBe(false);
    expect(mentionsPublicId(URL, "")).toBe(false);
  });
});

describe("usagesInDocs — labels and locations", () => {
  test("home hero, a featured card and the creative panel, with page names from PAGE_ROWS", () => {
    const home = {
      slug: "home",
      data: {
        hero: { image: image(URL) },
        featuredCards: [{ image: image(OTHER) }, { image: image(URL) }],
        creativeSystem: { image: image(URL) },
      },
    };
    const found = usagesInDocs(docs({ sections: [home] }), ID);
    expect(found.map((u) => u.label)).toEqual([
      "Home — hero",
      "Home — featured card 2",
      "Home — creative system panel",
    ]);
    expect(found[1]).toMatchObject({ collection: "page_sections", key: { slug: "home" }, path: "data.featuredCards.1.image", kind: "image" });
  });

  test("about discipline cards", () => {
    const about = { slug: "about", data: { disciplines: [{ image: image(URL) }] } };
    expect(usagesInDocs(docs({ sections: [about] }), ID).map((u) => u.label)).toEqual(["About — discipline card 1"]);
  });

  test("leftover keys from older page layouts never count — nothing renders them", () => {
    const home = { slug: "home", data: { trust: { image: image(URL) }, servicesPreview: { image: image(URL) } } };
    const about = { slug: "about", data: { approach: [{ image: image(URL) }] } };
    expect(usagesInDocs(docs({ sections: [home, about] }), ID)).toEqual([]);
  });

  test("Work overlay card images use the discipline label", () => {
    const found = usagesInDocs(docs({ settings: [{ slug: "nft", cardImage: image(URL) }] }), ID);
    expect(found).toEqual([
      { label: "Work overlay — NFT", collection: "page_settings", key: { slug: "nft" }, path: "cardImage", kind: "image" },
    ]);
  });

  test("share images use the SEO row label", () => {
    const found = usagesInDocs(docs({ seo: [{ slug: "about", ogImageUrl: URL }] }), ID);
    expect(found.map((u) => [u.label, u.kind])).toEqual([["About — share image", "url"]]);
  });

  test("blog posts report the cover and the text separately", () => {
    const post = { _id: "p1", title: "Night shoot", coverImageUrl: URL, content: `Intro\n\n![x](${URL})` };
    expect(usagesInDocs(docs({ posts: [post] }), ID).map((u) => [u.label, u.kind])).toEqual([
      ["Blog post “Night shoot” — cover", "url"],
      ["Blog post “Night shoot” — text", "markdown"],
    ]);
  });

  test("an unrelated file finds nothing", () => {
    const home = { slug: "home", data: { hero: { image: image(OTHER) } } };
    expect(usagesInDocs(docs({ sections: [home], seo: [{ slug: "home", ogImageUrl: OTHER }] }), ID)).toEqual([]);
  });
});

describe("edits", () => {
  test("image slots empty out or take the new link, never keeping a publicId", () => {
    expect(editedValue("image", image(URL), ID, { type: "remove" })).toEqual({ url: "", publicId: "" });
    expect(editedValue("image", image(URL), ID, { type: "replace", url: OTHER })).toEqual({ url: OTHER, publicId: "" });
    expect(editedValue("url", URL, ID, { type: "remove" })).toBe("");
  });

  test("removing from markdown drops the image, unwraps a link and strips a bare URL — other files stay", () => {
    const content = `A\n\n![shot](${URL} "t")\n\n[see it](${URL})\n\n${URL}\n\n![keep](${OTHER})`;
    expect(editMarkdown(content, ID, { type: "remove" })).toBe(`A\n\n\n\nsee it\n\n\n\n![keep](${OTHER})`);
  });

  test("replacing in markdown swaps every link to the file", () => {
    const content = `![a](${URL}) and [b](${URL})`;
    expect(editMarkdown(content, ID, { type: "replace", url: OTHER })).toBe(`![a](${OTHER}) and [b](${OTHER})`);
  });
});

describe("media-in-use payload", () => {
  test("reads a 409 body and ignores malformed items", () => {
    const items = readMediaInUse({
      code: MEDIA_IN_USE,
      items: [{ id: "1", title: "A", usedOn: ["Home — hero"] }, { id: 2 }],
    });
    expect(items).toEqual([{ id: "1", title: "A", usedOn: ["Home — hero"] }]);
    expect(readMediaInUse({ error: "other" })).toBeNull();
  });

  test("error text names every place", () => {
    expect(formatMediaInUseError([{ id: "1", title: "A", usedOn: ["Home — hero", "Work overlay — NFT"] }])).toBe(
      "“A” is used in: Home — hero, Work overlay — NFT."
    );
  });

  test("only the two known choices are accepted", () => {
    expect(parseMediaUsageChoice("replace")).toBe("replace");
    expect(parseMediaUsageChoice("remove")).toBe("remove");
    expect(parseMediaUsageChoice("delete")).toBeNull();
  });
});
