import { getDb } from "@/lib/server/db";

export type PageSeo = {
  slug: string;
  title: string;
  description: string;
  headerTitle: string;
  headerDescription: string;
  ogImageUrl: string;
  updatedAt: Date;
};

type SeoDefaults = Pick<
  PageSeo,
  "title" | "description" | "headerTitle" | "headerDescription"
>;

const DEFAULTS: Record<string, SeoDefaults> = {
  home: {
    title: "HM Visuals",
    description:
      "Cinematic photography, film, NFTs, dance, and creative development by Hussain Marzooq.",
    headerTitle:
      "Cinematic visual direction for people, movement, fashion, weddings, and digital culture.",
    headerDescription:
      "Photography, film, dance, NFT work, and creative web systems shaped with atmosphere, precision, and a high-end visual language.",
  },
  about: {
    title: "About — HM Visuals",
    description:
      "Hussain Marzooq — internationally exhibited photographer, videographer, NFT artist, and dancer based in Dubai, working with clients and galleries worldwide.",
    headerTitle:
      "Hussain Marzooq — photographer, videographer, NFT artist, and dancer based in Dubai.",
    headerDescription:
      "I'm a photographer and filmmaker based in Dubai, working with clients and galleries around the world. My work moves between stills, film, digital art, and dance — the same eye for light, atmosphere, and timing runs through all of it. A portrait, a wedding, a fashion film, a minted edition, a moment on stage: every time, I'm after the same thing — an image with presence.",
  },
  photography: {
    title: "Photography — HM Visuals",
    description:
      "Cinematic portraits, fashion, weddings, events, and emotional visual stories by Hussain Marzooq.",
    headerTitle: "Photography",
    headerDescription:
      "Cinematic portraits, fashion, weddings, events, and emotional visual stories.",
  },
  videography: {
    title: "Videography — HM Visuals",
    description:
      "Film work across weddings, events, brand campaigns, and performance by Hussain Marzooq.",
    headerTitle: "Videography",
    headerDescription:
      "Cinematic films, dance, events, fashion, weddings, and movement-led visual stories.",
  },
  nft: {
    title: "NFT Collection — HM Visuals",
    description:
      "Collectible NFT works, edition structures, availability, and marketplace access by HM Visuals.",
    headerTitle: "NFT",
    headerDescription:
      "Published collectible works, edition structure, and marketplace access — all presented inside one unified collection page.",
  },
  dancing: {
    title: "Dancing — HM Visuals",
    description:
      "Movement, performance, and dance teaching by Hussain Marzooq. Based in Dubai, available worldwide.",
    headerTitle: "Dancing",
    headerDescription:
      "Performance, teaching, and visual work shaped around rhythm, motion, presence, and the way bodies transform space on camera.",
  },
  "web-development": {
    title: "Web Development — HM Visuals",
    description:
      "Portfolios, creative platforms, and Web3-ready digital experiences built by Hussain Marzooq.",
    headerTitle: "Web Development",
    headerDescription:
      "Design-led front-end work, custom portfolio systems, admin flows, and digital presentation tools connected to the same creative direction as the visual work.",
  },
  contact: {
    title: "Book a Session — HM Visuals",
    description:
      "Start a photography, film, NFT, or web project with Hussain Marzooq. Inquire for pricing and availability.",
    headerTitle: "Contact / Booking",
    headerDescription:
      "Tell me what you want to create and I'll reply with the best direction for the project.",
  },
  services: {
    title: "Creative Services — HM Visuals",
    description:
      "Premium photography, filmmaking, creative direction, dancing, web development, and NFT services by HM Visuals.",
    headerTitle: "Services",
    headerDescription:
      "Photography, film, dance, creative direction, web systems, and digital work shaped around the tone of the project.",
  },
  people: {
    title: "People — HM Visuals",
    description:
      "Clients and subjects photographed and filmed by Hussain Marzooq.",
    headerTitle: "People",
    headerDescription:
      "Portraits, collaborators, artists, dancers, clients, and people connected to the visual work.",
  },
  // Template for every /people/[slug] page — {name} is replaced with the
  // person's name at render time. The on-page header is the person's own
  // name/bio (edited per person in the People admin), so only the search &
  // social fields are exposed for this slug.
  "people-detail": {
    title: "{name} — HM Visuals",
    description:
      "Portraits, film, and visual work with {name} by Hussain Marzooq — photography, creative direction, and movement-led stories.",
    headerTitle: "{name}",
    headerDescription: "",
  },
  blog: {
    title: "Blog — HM Visuals",
    description:
      "Behind the work, creative process, and visual essays by Hussain Marzooq.",
    headerTitle: "Blog",
    headerDescription:
      "Visual essays, creative process, and long-form writing around photography, film, movement, and image-making.",
  },
  testimonials: {
    title: "Testimonials — HM Visuals",
    description:
      "What clients say about working with HM Visuals — photography, film, and creative direction.",
    headerTitle: "What people say about me",
    headerDescription:
      "Real feedback from shoots, films, events, classes, and creative collaborations.",
  },
};

export const ALL_SEO_SLUGS = Object.keys(DEFAULTS);

export async function getPageSeo(slug: string): Promise<PageSeo> {
  const defaults = DEFAULTS[slug] ?? {
    title: "HM Visuals",
    description: "",
    headerTitle: "HM Visuals",
    headerDescription: "",
  };
  try {
    const db = await getDb();
    const doc = await db.collection("page_seo").findOne({ slug });
    return {
      slug,
      title: typeof doc?.title === "string" && doc.title ? doc.title : defaults.title,
      description: typeof doc?.description === "string" ? doc.description : defaults.description,
      headerTitle:
        typeof doc?.headerTitle === "string" && doc.headerTitle
          ? doc.headerTitle
          : defaults.headerTitle,
      headerDescription:
        typeof doc?.headerDescription === "string"
          ? doc.headerDescription
          : defaults.headerDescription,
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
        headerTitle:
          typeof doc?.headerTitle === "string" && doc.headerTitle
            ? doc.headerTitle
            : defaults.headerTitle,
        headerDescription:
          typeof doc?.headerDescription === "string"
            ? doc.headerDescription
            : defaults.headerDescription,
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
