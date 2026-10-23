import { describe, expect, it } from "vitest";
import {
  OTHER_SITE,
  PROFILE_NETWORKS,
  linksFromRows,
  profileLinkAddress,
  profileLinkRow,
  shortAddress,
  withNetwork,
  type ProfileLinkKind,
} from "@/lib/profile-links";
import { SOCIAL_NETWORKS, socialNetworkOf } from "@/lib/social-links";

const address = (network: ProfileLinkKind, value: string) => profileLinkAddress({ network, value });

// What each network's field takes and the address it builds, checked against a
// live profile of each network on 2026-10-24.
const SAMPLES: Record<string, [string, string]> = {
  instagram: ["hussain.art", "https://www.instagram.com/hussain.art/"],
  tiktok: ["hussain_art", "https://www.tiktok.com/@hussain_art"],
  youtube: ["HussainArt", "https://www.youtube.com/@HussainArt"],
  vimeo: ["hussainart", "https://vimeo.com/hussainart"],
  behance: ["hussainart", "https://www.behance.net/hussainart"],
  linkedin: ["hussain-marzooq", "https://www.linkedin.com/in/hussain-marzooq/"],
  facebook: ["hussain.art", "https://www.facebook.com/hussain.art"],
  x: ["hussain_art", "https://x.com/hussain_art"],
  threads: ["hussain.art", "https://www.threads.com/@hussain.art"],
  opensea: ["hussainart", "https://opensea.io/hussainart"],
  "500px": ["hussainart", "https://500px.com/p/hussainart"],
  artstation: ["hussainart", "https://www.artstation.com/hussainart"],
  dribbble: ["hussainart", "https://dribbble.com/hussainart"],
  flickr: ["hussainart", "https://www.flickr.com/photos/hussainart/"],
  github: ["hussain-art", "https://github.com/hussain-art"],
  pinterest: ["hussainart", "https://www.pinterest.com/hussainart/"],
  rarible: ["hussainart", "https://rarible.com/hussainart"],
  snapchat: ["hussain.art", "https://www.snapchat.com/@hussain.art"],
  soundcloud: ["hussainart", "https://soundcloud.com/hussainart"],
  spotify: ["https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02", "https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02"],
  telegram: ["hussain_art", "https://t.me/hussain_art"],
  tumblr: ["hussain-art", "https://www.tumblr.com/hussain-art"],
  vsco: ["hussainart", "https://vsco.co/hussainart/gallery"],
  whatsapp: ["+971501234567", "https://wa.me/971501234567"],
};

describe("PROFILE_NETWORKS", () => {
  it("lists every icon network plus LinkedIn, Hussain's first and the rest A–Z", () => {
    const keys = PROFILE_NETWORKS.map((network) => network.key);
    expect(keys).toEqual([
      "instagram", "tiktok", "youtube", "vimeo", "behance", "linkedin", "facebook", "x", "threads", "opensea",
      "500px", "artstation", "dribbble", "flickr", "github", "pinterest", "rarible", "snapchat", "soundcloud",
      "spotify", "telegram", "tumblr", "vsco", "whatsapp",
    ]);
    expect(new Set(keys)).toEqual(new Set([...SOCIAL_NETWORKS.map((network) => network.key), "linkedin"]));
  });
});

describe("every network", () => {
  it.each(PROFILE_NETWORKS.map((network) => network.key))("%s builds its address and reads it back", (key) => {
    const [value, expected] = SAMPLES[key]!;
    expect(address(key, value)).toEqual({ address: expected });

    const row = profileLinkRow(expected, true);
    expect(row).toEqual({ network: key, value, shown: true });
    expect(address(row.network, row.value)).toEqual({ address: expected });
  });

  it("gives the social column the matching icon for every built address", () => {
    for (const network of PROFILE_NETWORKS) {
      const [, built] = SAMPLES[network.key]!;
      expect(socialNetworkOf(built)?.key ?? null).toBe(network.key === "linkedin" ? null : network.key);
    }
  });
});

describe("what people paste", () => {
  it("takes a name, @name or a profile link for the same address", () => {
    const expected = { address: "https://www.instagram.com/hussain.art/" };
    for (const value of [
      "hussain.art",
      "@hussain.art",
      "  hussain.art ",
      "https://www.instagram.com/hussain.art/",
      "https://instagram.com/hussain.art?igsh=abc123",
      "instagram.com/hussain.art",
      "www.instagram.com/hussain.art/",
      "HTTP://INSTAGRAM.COM/hussain.art",
    ]) {
      expect(address("instagram", value), value).toEqual(expected);
    }
  });

  it("rebuilds other address shapes of the same network", () => {
    expect(address("x", "https://twitter.com/hussain_art")).toEqual({ address: "https://x.com/hussain_art" });
    expect(address("threads", "threads.net/@hussain.art")).toEqual({ address: "https://www.threads.com/@hussain.art" });
    expect(address("snapchat", "https://www.snapchat.com/add/hussain.art")).toEqual({
      address: "https://www.snapchat.com/@hussain.art",
    });
    expect(address("flickr", "https://www.flickr.com/people/12345678@N00/")).toEqual({
      address: "https://www.flickr.com/photos/12345678@N00/",
    });
    expect(address("youtube", "https://m.youtube.com/@HussainArt/videos")).toEqual({
      address: "https://www.youtube.com/@HussainArt",
    });
    expect(address("tiktok", "https://www.tiktok.com/@hussain_art?lang=en")).toEqual({
      address: "https://www.tiktok.com/@hussain_art",
    });
    expect(address("rarible", "https://og.rarible.com/hussainart")).toEqual({ address: "https://rarible.com/hussainart" });
  });

  it("keeps the Spotify address shape that was pasted, without the language or share bits", () => {
    expect(address("spotify", "https://open.spotify.com/intl-ar/artist/06HL4z0CvFAxyc27GXpf02?si=abc")).toEqual({
      address: "https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02",
    });
    expect(address("spotify", "open.spotify.com/user/hussain.art")).toEqual({
      address: "https://open.spotify.com/user/hussain.art",
    });
  });

  it("takes a WhatsApp number written any usual way", () => {
    for (const value of ["+971 50 123 4567", "+971 (50) 123-4567", "971501234567", "https://wa.me/971501234567"]) {
      expect(address("whatsapp", value), value).toEqual({ address: "https://wa.me/971501234567" });
    }
  });

  it("lowercases SoundCloud names and encodes non-Latin YouTube handles", () => {
    expect(address("soundcloud", "HussainArt")).toEqual({ address: "https://soundcloud.com/hussainart" });
    const arabic = address("youtube", "@حسين");
    expect(arabic).toEqual({ address: `https://www.youtube.com/@${encodeURIComponent("حسين")}` });
    expect(profileLinkRow((arabic as { address: string }).address, false)).toEqual({
      network: "youtube",
      value: "حسين",
      shown: false,
    });
  });

  it("is empty for an empty field", () => {
    expect(address("instagram", "   ")).toBeNull();
    expect(address(OTHER_SITE, "")).toBeNull();
  });
});

describe("refusals", () => {
  it("names a character the network's usernames cannot contain", () => {
    expect(address("instagram", "hussain art")).toEqual({ error: "Instagram usernames cannot contain spaces" });
    expect(address("x", "hussain-art")).toEqual({ error: "X usernames cannot contain “-”" });
    expect(address("github", "hussain_art")).toEqual({ error: "GitHub usernames cannot contain “_”" });
    expect(address("vimeo", "a?b")).toEqual({ error: "Vimeo usernames cannot contain “?”" });
  });

  it("holds each network's length and the 100-character cap", () => {
    expect(address("x", "a".repeat(16))).toEqual({ error: "X usernames are at most 15 characters" });
    expect(address("vimeo", "a".repeat(101))).toEqual({ error: "usernames are at most 100 characters" });
    expect(address("instagram", "a".repeat(501))).toEqual({ error: "too long" });
  });

  it("refuses another site's link, a lookalike host and a non-web link", () => {
    expect(address("instagram", "https://www.tiktok.com/@hussain_art")).toEqual({ error: "not an Instagram address" });
    expect(address("instagram", "https://instagram.com.example.org/hussain")).toEqual({ error: "not an Instagram address" });
    expect(address("instagram", "javascript:alert(1)")).toEqual({ error: "not an Instagram address" });
    expect(address("x", "data:text/html,hi")).toEqual({ error: "not an X address" });
  });

  it("refuses a link to something that is not a profile", () => {
    expect(address("instagram", "https://www.instagram.com/p/abc123/")).toEqual({
      error: "not a link to an Instagram profile",
    });
    expect(address("instagram", "instagram.com")).toEqual({ error: "not a link to an Instagram profile" });
    expect(address("facebook", "https://www.facebook.com/profile.php?id=100")).toEqual({
      error: "“profile.php” is not a Facebook username",
    });
    expect(address("spotify", "hussain")).toEqual({ error: "not a link to a Spotify profile" });
    expect(address("spotify", "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M")).toEqual({
      error: "not a link to a Spotify profile",
    });
  });

  it("wants a WhatsApp number with its country code", () => {
    expect(address("whatsapp", "050 123 4567")).toEqual({ error: "not a WhatsApp number with its country code" });
    expect(address("whatsapp", "call me")).toEqual({ error: "not a WhatsApp number with its country code" });
  });

  it("wants a whole web address for another site", () => {
    expect(address(OTHER_SITE, "objkt.com/profile/hussain")).toEqual({ error: "not a valid web address" });
    expect(address(OTHER_SITE, "javascript:alert(1)")).toEqual({ error: "not a valid web address" });
    expect(address(OTHER_SITE, "https://objkt.com/profile/hussain")).toEqual({
      address: "https://objkt.com/profile/hussain",
    });
  });
});

describe("profileLinkRow", () => {
  it("shows an address no rule fits as Other site, unchanged", () => {
    for (const link of [
      "https://www.youtube.com/channel/UCBR8-60-B28hp2BmDPdntcQ",
      "https://objkt.com/profile/hussain",
      "https://x.com/not-a-handle",
      "https://api.whatsapp.com/send/?phone=971501234567",
      "",
    ]) {
      expect(profileLinkRow(link, false), link).toEqual({ network: OTHER_SITE, value: link, shown: false });
    }
  });

  it("reads a saved link with extra bits as the clean username", () => {
    expect(profileLinkRow("https://instagram.com/hussain.art?igsh=abc", true)).toEqual({
      network: "instagram",
      value: "hussain.art",
      shown: true,
    });
  });
});

describe("withNetwork", () => {
  it("turns a username into its full address under Other site, and back", () => {
    const row = { network: "instagram" as const, value: "hussain.art", shown: true };
    const other = withNetwork(row, OTHER_SITE);
    expect(other).toEqual({ network: OTHER_SITE, value: "https://www.instagram.com/hussain.art/", shown: true });
    expect(withNetwork(other, "instagram")).toEqual(row);
  });

  it("keeps what was typed when the new network cannot read it", () => {
    expect(withNetwork({ network: "instagram", value: "hussain.art", shown: false }, "tiktok")).toEqual({
      network: "tiktok",
      value: "hussain.art",
      shown: false,
    });
    expect(withNetwork({ network: "x", value: "bad name", shown: false }, OTHER_SITE)).toEqual({
      network: OTHER_SITE,
      value: "bad name",
      shown: false,
    });
  });
});

describe("linksFromRows", () => {
  it("builds the stored addresses and the shown ones, dropping empty rows", () => {
    expect(
      linksFromRows([
        { network: "instagram", value: "@hussain.art", shown: true },
        { network: "tiktok", value: "", shown: true },
        { network: OTHER_SITE, value: "https://objkt.com/profile/hussain", shown: false },
        { network: "whatsapp", value: "+971 50 123 4567", shown: true },
      ])
    ).toEqual({
      links: ["https://www.instagram.com/hussain.art/", "https://objkt.com/profile/hussain", "https://wa.me/971501234567"],
      shownLinks: ["https://www.instagram.com/hussain.art/", "https://wa.me/971501234567"],
    });
  });

  it("names the row that does not build", () => {
    expect(linksFromRows([{ network: "x", value: "fine", shown: false }, { network: "x", value: "not fine" }])).toEqual({
      error: "Profile link 2: X usernames cannot contain spaces",
    });
    expect(linksFromRows([{ network: "myspace", value: "hussain" }])).toEqual({ error: "Profile link 1: unknown network" });
    expect(linksFromRows([{ network: "instagram", value: 7 }])).toEqual({ error: "Profile link 1 is not valid" });
    expect(linksFromRows(["https://a.test"])).toEqual({ error: "Profile link 1 is not valid" });
  });

  it("refuses a body that is not a list, or more than 20 rows", () => {
    expect(linksFromRows("instagram")).toEqual({ error: "Profile links must be a list" });
    expect(linksFromRows(Array(21).fill({ network: "x", value: "a" }))).toEqual({
      error: "Keep profile links to 20 or fewer",
    });
  });
});

describe("shortAddress", () => {
  it("drops the scheme, www. and a closing slash", () => {
    expect(shortAddress("https://www.instagram.com/hussain.art/")).toBe("instagram.com/hussain.art");
    expect(shortAddress("https://x.com/hussain_art")).toBe("x.com/hussain_art");
  });
});
