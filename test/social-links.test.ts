import { describe, it, expect } from "vitest";
import {
  SOCIAL_DOCK_MAX,
  SOCIAL_NETWORKS,
  hostsNeedingLogo,
  linkHost,
  linkLogosOf,
  socialItems,
  socialNetworkOf,
  type LinkLogo,
} from "@/lib/social-links";
import { SOCIAL_ICON_PATHS } from "@/components/site/social-icons";

const logo = (host: string, url = `https://res.cloudinary.com/x/image/upload/v1/hm_visuals/sections/logos/${host}.png`): LinkLogo => ({
  host,
  image: { url, publicId: `hm_visuals/sections/logos/${host}` },
});

describe("socialNetworkOf", () => {
  it("matches a network's own host, with or without www", () => {
    expect(socialNetworkOf("https://www.instagram.com/hussain")?.key).toBe("instagram");
    expect(socialNetworkOf("https://instagram.com/hussain")?.key).toBe("instagram");
    expect(socialNetworkOf("https://opensea.io/hussain")?.key).toBe("opensea");
  });

  it("matches subdomains and every listed host", () => {
    expect(socialNetworkOf("https://m.youtube.com/@hussain")?.key).toBe("youtube");
    expect(socialNetworkOf("https://youtu.be/abc")?.key).toBe("youtube");
    expect(socialNetworkOf("https://twitter.com/hussain")?.key).toBe("x");
    expect(socialNetworkOf("https://x.com/hussain")?.key).toBe("x");
    expect(socialNetworkOf("https://hussain.tumblr.com")?.key).toBe("tumblr");
  });

  it("ignores case and a trailing dot", () => {
    expect(socialNetworkOf("https://WWW.Instagram.COM./hussain")?.key).toBe("instagram");
  });

  it("rejects lookalike hosts", () => {
    expect(socialNetworkOf("https://instagram.com.example.org/hussain")).toBeNull();
    expect(socialNetworkOf("https://notinstagram.com/hussain")).toBeNull();
    expect(socialNetworkOf("https://instagram.co/hussain")).toBeNull();
    expect(socialNetworkOf("https://evil.com/instagram.com")).toBeNull();
    expect(socialNetworkOf("https://instagram.com@evil.com/")).toBeNull();
  });

  it("rejects non-web links", () => {
    expect(socialNetworkOf("javascript:alert(1)//instagram.com")).toBeNull();
    expect(socialNetworkOf("mailto:a@instagram.com")).toBeNull();
    expect(socialNetworkOf("instagram.com/hussain")).toBeNull();
    expect(socialNetworkOf("")).toBeNull();
  });
});

describe("linkHost", () => {
  it("returns the lower-case host without www", () => {
    expect(linkHost("https://www.LinkedIn.com/in/hussain")).toBe("linkedin.com");
    expect(linkHost("http://objkt.com/profile/x")).toBe("objkt.com");
    expect(linkHost("https://xn--bcher-kva.example/")).toBe("xn--bcher-kva.example");
  });

  it("refuses addresses that are not public domain names", () => {
    expect(linkHost("http://localhost:3000/")).toBeNull();
    expect(linkHost("http://127.0.0.1/")).toBeNull();
    expect(linkHost("http://[::1]/")).toBeNull();
    expect(linkHost("http://169.254.169.254/latest")).toBeNull();
    expect(linkHost("http://intranet/")).toBeNull();
    expect(linkHost("ftp://example.com/")).toBeNull();
    expect(linkHost("not a url")).toBeNull();
  });
});

describe("hostsNeedingLogo", () => {
  it("lists each site without a built-in icon once", () => {
    expect(
      hostsNeedingLogo([
        "https://instagram.com/h",
        "https://www.linkedin.com/in/h",
        "https://linkedin.com/company/h",
        "https://objkt.com/profile/h",
        "http://localhost/",
        "nonsense",
      ])
    ).toEqual(["linkedin.com", "objkt.com"]);
  });
});

describe("linkLogosOf", () => {
  it("keeps only well-formed logos with an image", () => {
    expect(
      linkLogosOf([
        logo("objkt.com"),
        { host: "", image: { url: "u", publicId: "p" } },
        { host: "linkedin.com", image: { url: "", publicId: "" } },
        { host: "a.com" },
        "x",
      ])
    ).toEqual([logo("objkt.com")]);
    expect(linkLogosOf(undefined)).toEqual([]);
    expect(linkLogosOf({})).toEqual([]);
  });
});

describe("socialItems", () => {
  it("shows built-in icons and stored logos in profile order", () => {
    expect(
      socialItems(
        ["https://objkt.com/profile/h", "https://instagram.com/h", "https://www.linkedin.com/in/h"],
        [logo("objkt.com")]
      )
    ).toEqual([
      { href: "https://objkt.com/profile/h", label: "objkt.com", logo: logo("objkt.com").image.url },
      { href: "https://instagram.com/h", label: "Instagram", network: "instagram" },
    ]);
  });

  it("drops duplicates, blanks and invalid links", () => {
    expect(
      socialItems(["https://x.com/h", " https://x.com/h ", "", "javascript:alert(1)", "https://x.com/h"], [])
    ).toEqual([{ href: "https://x.com/h", label: "X", network: "x" }]);
  });

  it(`caps the column at ${SOCIAL_DOCK_MAX}`, () => {
    const links = SOCIAL_NETWORKS.map((network) => `https://${network.hosts[0]}/h`);
    const items = socialItems(links, []);
    expect(items).toHaveLength(SOCIAL_DOCK_MAX);
    expect(items[0]).toMatchObject({ network: "instagram" });
  });

  it("is empty for an empty profile", () => {
    expect(socialItems([], [logo("objkt.com")])).toEqual([]);
  });
});

describe("SOCIAL_ICON_PATHS", () => {
  it("has a path for every network", () => {
    for (const network of SOCIAL_NETWORKS) {
      expect(SOCIAL_ICON_PATHS[network.key]).toMatch(/^M/);
    }
  });
});
