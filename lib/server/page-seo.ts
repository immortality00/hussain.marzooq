import { getDb } from "@/lib/server/db";

export type PageSeo = {
  slug: string;
  title: string;
  description: string;
  ogImageUrl: string;
  updatedAt: Date;
};

const DEFAULTS: Record<string, Pick<PageSeo, "title" | "description">> = {
  home: {
    title: "HM Visuals",
    description:
      "Cinematic photography, film, NFTs, dance, and creative development by Hussain Marzooq.",
  },
  about: {
    title: "About — HM Visuals",
    description:
      "The creative practice of Hussain Marzooq — internationally exhibited photographer, videographer, NFT artist, and dance teacher based in Dubai.",
  },
  photography: {
    title: "Photography — HM Visuals",
    description:
      "Cinematic portraits, fashion, weddings, events, and emotional visual stories by Hussain Marzooq.",
  },
  videography: {
    title: "Videography — HM Visuals",
    description:
      "Film work across weddings, events, brand campaigns, and performance by Hussain Marzooq.",
  },
  nft: {
    title: "NFT Collection — HM Visuals",
    description:
      "Collectible NFT works, edition structures, availability, and marketplace access by HM Visuals.",
  },
  dancing: {
    title: "Dancing — HM Visuals",
    description:
      "Movement, performance, and dance teaching by Hussain Marzooq. Based in Dubai, available worldwide.",
  },
  "web-development": {
    title: "Web Development — HM Visuals",
    description:
      "Portfolios, creative platforms, and Web3-ready digital experiences built by Hussain Marzooq.",
  },
  contact: {
    title: "Book a Session — HM Visuals",
    description:
      "Start a photography, film, NFT, or web project with Hussain Marzooq. Inquire for pricing and availability.",
  },
  services: {
    title: "Creative Services — HM Visuals",
    description:
      "Premium photography, filmmaking, creative direction, dancing, web development, and NFT services by HM Visuals.",
  },
  people: {
    title: "People — HM Visuals",
    description:
      "Clients and subjects photographed and filmed by Hussain Marzooq.",
  },
  blog: {
    title: "Blog — HM Visuals",
    description:
      "Behind the work, creative process, and visual essays by Hussain Marzooq.",
  },
  testimonials: {
    title: "Testimonials — HM Visuals",
    description:
      "What clients say about working with HM Visuals — photography, film, and creative direction.",
  },
};

export const ALL_SEO_SLUGS = Object.keys(DEFAULTS);

export async function getPageSeo(slug: string): Promise<PageSeo> {
  const defaults = DEFAULTS[slug] ?? { title: "HM Visuals", description: "" };
  try {
    const db = await getDb();
    const doc = await db.collection("page_seo").findOne({ slug });
    return {
      slug,
      title: typeof doc?.title === "string" && doc.title ? doc.title : defaults.title,
      description: typeof doc?.description === "string" ? doc.description : defaults.description,
      ogImageUrl: typeof doc?.ogImageUrl === "string" ? doc.ogImageUrl : "",
      updatedAt: doc?.updatedAt instanceof Date ? doc.updatedAt : new Date(),
    };
  } catch {
    return { slug, ...defaults, ogImageUrl: "", updatedAt: new Date() };
  }
}

export async function getAllPageSeo(): Promise<PageSeo[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection("page_seo")
      .find({ slug: { $in: ALL_SEO_SLUGS } })
      .toArray();
    const map = new Map(docs.map((d) => [d.slug as string, d]));
    return ALL_SEO_SLUGS.map((slug) => {
      const doc = map.get(slug);
      const defaults = DEFAULTS[slug]!;
      return {
        slug,
        title: typeof doc?.title === "string" && doc.title ? doc.title : defaults.title,
        description: typeof doc?.description === "string" ? doc.description : defaults.description,
        ogImageUrl: typeof doc?.ogImageUrl === "string" ? doc.ogImageUrl : "",
        updatedAt: doc?.updatedAt instanceof Date ? doc.updatedAt : new Date(),
      };
    });
  } catch {
    return ALL_SEO_SLUGS.map((slug) => ({
      slug,
      ...DEFAULTS[slug]!,
      ogImageUrl: "",
      updatedAt: new Date(),
    }));
  }
}
