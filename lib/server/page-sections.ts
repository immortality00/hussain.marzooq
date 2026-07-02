import { getDb } from "@/lib/server/db";
import type { FeaturedCard, TextCard, CtaCopy } from "@/lib/page-sections-shared";

export type { FeaturedCard, FeaturedCardSlug, TextCard, CtaCopy } from "@/lib/page-sections-shared";

export type HomeSections = {
  // Named featuredCards (not featuredWork) on purpose: mergeWithDefaults is a
  // shallow spread, so reusing the old key would let a stale fixed-key object
  // from an existing Mongo doc override the array shape and break rendering.
  featuredCards: FeaturedCard[];
  creativeSystem: { heading: string; paragraph: string };
  servicesPreview: { heading: string };
  trust: { heading: string; fallbackParagraph: string };
  stickyCta: CtaCopy;
};

export type AboutSections = {
  disciplines: TextCard[];
  stickyCta: CtaCopy;
};

export type DancingSections = {
  sections: TextCard[];
  stickyCta: CtaCopy;
};

export type WebDevSections = {
  capabilities: TextCard[];
  stickyCta: CtaCopy;
};

export type BlogSections = {
  pillars: TextCard[];
  stickyCta: CtaCopy;
};

export type CtaOnlySections = { stickyCta: CtaCopy };

export type PageSectionsMap = {
  home: HomeSections;
  about: AboutSections;
  photography: CtaOnlySections;
  videography: CtaOnlySections;
  dancing: DancingSections;
  "web-development": WebDevSections;
  blog: BlogSections;
  nft: CtaOnlySections;
  people: CtaOnlySections;
  "people-detail": CtaOnlySections;
  testimonials: CtaOnlySections;
};

export type PageSectionsSlug = keyof PageSectionsMap;

// Matches the previous hardcoded <StickyCta /> component defaults, so wiring
// these pages through the CMS changes zero visible copy on day one.
const BOOKING_CTA: CtaCopy = {
  title: "Ready to book?",
  description: "Tell me what you need and I’ll reply with the best next step.",
  buttonLabel: "Book",
};

const DEFAULTS: PageSectionsMap = {
  home: {
    featuredCards: [
      {
        slug: "photography",
        title: "Photography with cinematic presence.",
        description: "Portraits, fashion, weddings, events, and editorial visual stories.",
      },
      {
        slug: "videography",
        title: "Film work shaped by motion and rhythm.",
        description:
          "Dance, events, fashion films, weddings, festivals, and atmosphere-led stories.",
      },
      {
        slug: "nft",
        title: "Digital work with collector-ready presentation.",
        description: "",
      },
    ],
    creativeSystem: {
      heading:
        "One visual identity across stills, film, movement, collectibles, and web experiences.",
      paragraph:
        "The portfolio connects creative disciplines through the same cinematic taste, clean presentation, and strong visual direction.",
    },
    servicesPreview: {
      heading: "Services built around strong direction, clean delivery, and premium presentation.",
    },
    trust: {
      heading: "Trust built through clear direction and strong final delivery.",
      fallbackParagraph:
        "Photography, film, movement, and creative direction shaped with care from the first conversation to the final selection.",
    },
    stickyCta: {
      title: "Ready to create something strong?",
      description: "Tell me the work you need and I'll reply with the best direction.",
      buttonLabel: "Book",
    },
  },
  about: {
    disciplines: [
      {
        title: "Photography",
        text: "Portraits, fashion, events, and cinematic still work shaped around atmosphere, presence, and strong visual identity.",
      },
      {
        title: "Film",
        text: "Movement, performance, weddings, festivals, and brand-led stories built with rhythm, emotion, and visual direction.",
      },
      {
        title: "Digital craft",
        text: "Interfaces, portfolios, Web3-ready presentation systems, and custom tools that connect creative work with a refined online experience.",
      },
      {
        title: "Movement",
        text: "Dance and performance influence the way the camera reads posture, timing, energy, and the space around the subject.",
      },
    ],
    stickyCta: BOOKING_CTA,
  },
  photography: { stickyCta: BOOKING_CTA },
  videography: { stickyCta: BOOKING_CTA },
  dancing: {
    sections: [
      {
        title: "Performance",
        text: "Movement-led visuals, stage energy, rehearsals, and cinematic dance-driven storytelling.",
      },
      {
        title: "Teaching",
        text: "Classes, workshops, training sessions, and educational visual content shaped with clarity and rhythm.",
      },
      {
        title: "Collaborations",
        text: "Creative partnerships with artists, festivals, brands, and visual projects built around movement.",
      },
    ],
    stickyCta: BOOKING_CTA,
  },
  "web-development": {
    capabilities: [
      {
        title: "Creative portfolios",
        text: "High-end portfolio systems with strong visual direction, motion, media structure, and clear client pathways.",
      },
      {
        title: "Custom admin tools",
        text: "Content management flows built around real relationships between media, services, people, galleries, and inquiries.",
      },
      {
        title: "Front-end systems",
        text: "Design-led interfaces, reusable components, responsive layouts, and polished public presentation layers.",
      },
      {
        title: "Interactive direction",
        text: "Digital experiments, Web3-ready presentation, editorial sections, and cinematic UI moments where they add value.",
      },
    ],
    stickyCta: BOOKING_CTA,
  },
  blog: {
    pillars: [
      {
        title: "Portraits",
        text: "Thoughtful portrait direction, cinematic framing, and visual storytelling around people.",
      },
      {
        title: "Fashion",
        text: "Editorial styling, movement, mood, and image construction for strong visual identity.",
      },
      { title: "Weddings", text: "Emotion-led coverage with a premium and artistic point of view." },
      { title: "Film", text: "Cinematic shooting, visual pacing, and stronger moving-image work." },
    ],
    stickyCta: BOOKING_CTA,
  },
  nft: {
    stickyCta: {
      title: "Interested in a piece?",
      description: "Ask about availability, editions, or collector details.",
      buttonLabel: "Inquire",
    },
  },
  people: {
    stickyCta: {
      title: "Looking for portrait or people-focused work?",
      description: "Explore the portfolio or book a shoot.",
      buttonLabel: "Book a shoot",
    },
  },
  "people-detail": {
    stickyCta: {
      title: "Inspired by this style of work?",
      description: "Book a portrait, fashion, or people-focused shoot.",
      buttonLabel: "Book a shoot",
    },
  },
  testimonials: { stickyCta: BOOKING_CTA },
};

export const ALL_PAGE_SECTIONS_SLUGS = Object.keys(DEFAULTS) as PageSectionsSlug[];

function mergeWithDefaults<K extends PageSectionsSlug>(
  slug: K,
  doc: Record<string, unknown> | null | undefined,
): PageSectionsMap[K] {
  const defaults = DEFAULTS[slug];
  if (!doc) return defaults;
  return { ...defaults, ...(doc.data as Partial<PageSectionsMap[K]>) };
}

export async function getPageSections<K extends PageSectionsSlug>(
  slug: K,
): Promise<PageSectionsMap[K]> {
  try {
    const db = await getDb();
    const doc = await db.collection("page_sections").findOne({ slug });
    return mergeWithDefaults(slug, doc);
  } catch {
    return DEFAULTS[slug];
  }
}

export async function getAllPageSections(): Promise<
  { slug: PageSectionsSlug; data: PageSectionsMap[PageSectionsSlug] }[]
> {
  try {
    const db = await getDb();
    const docs = await db
      .collection("page_sections")
      .find({ slug: { $in: ALL_PAGE_SECTIONS_SLUGS } })
      .toArray();
    const map = new Map(docs.map((d) => [d.slug as string, d]));
    return ALL_PAGE_SECTIONS_SLUGS.map((slug) => ({
      slug,
      data: mergeWithDefaults(slug, map.get(slug)),
    }));
  } catch {
    return ALL_PAGE_SECTIONS_SLUGS.map((slug) => ({ slug, data: DEFAULTS[slug] }));
  }
}
