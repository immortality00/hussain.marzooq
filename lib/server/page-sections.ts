import { getDb } from "@/lib/server/db";

export type TextCard = { title: string; text: string };
export type CtaCopy = { title: string; description: string; buttonLabel: string };

export type HomeSections = {
  featuredWork: {
    photography: { title: string; description: string };
    film: { title: string; description: string };
  };
  creativeSystem: { heading: string; paragraph: string; nftCardTitle: string };
  servicesPreview: { heading: string };
  trust: { heading: string; fallbackParagraph: string };
  showreel: { heading: string };
  stickyCta: CtaCopy;
};

export type PanelWithParagraph = { label: string; paragraph: string };
export type PanelWithHeading = { label: string; heading: string; paragraph: string };
export type LabeledList = { label: string; items: string[] };

export type AboutSections = {
  creativePosition: PanelWithParagraph;
  disciplines: TextCard[];
  approach: PanelWithHeading;
  principles: LabeledList;
  closingCta: PanelWithHeading;
};

export type DancingSections = {
  movementLanguage: PanelWithParagraph;
  sections: TextCard[];
  direction: PanelWithHeading;
  workCovered: LabeledList;
  closingCta: PanelWithHeading;
};

export type WebDevSections = {
  creativeTechnology: PanelWithParagraph;
  capabilities: TextCard[];
  technicalDirection: PanelWithHeading;
  buildPrinciples: LabeledList;
  closingCta: PanelWithHeading;
};

export type BlogSections = {
  editorialDirection: PanelWithParagraph;
  pillars: TextCard[];
};

export type CtaOnlySections = { stickyCta: CtaCopy };

export type PageSectionsMap = {
  home: HomeSections;
  about: AboutSections;
  dancing: DancingSections;
  "web-development": WebDevSections;
  blog: BlogSections;
  nft: CtaOnlySections;
  people: CtaOnlySections;
  "people-detail": CtaOnlySections;
};

export type PageSectionsSlug = keyof PageSectionsMap;

const DEFAULTS: PageSectionsMap = {
  home: {
    featuredWork: {
      photography: {
        title: "Photography with cinematic presence.",
        description: "Portraits, fashion, weddings, events, and editorial visual stories.",
      },
      film: {
        title: "Film work shaped by motion and rhythm.",
        description:
          "Dance, events, fashion films, weddings, festivals, and atmosphere-led stories.",
      },
    },
    creativeSystem: {
      heading:
        "One visual identity across stills, film, movement, collectibles, and web experiences.",
      paragraph:
        "The portfolio connects creative disciplines through the same cinematic taste, clean presentation, and strong visual direction.",
      nftCardTitle: "Digital work with collector-ready presentation.",
    },
    servicesPreview: {
      heading: "Services built around strong direction, clean delivery, and premium presentation.",
    },
    trust: {
      heading: "Trust built through clear direction and strong final delivery.",
      fallbackParagraph:
        "Photography, film, movement, and creative direction shaped with care from the first conversation to the final selection.",
    },
    showreel: { heading: "Film, rhythm, and movement in one visual language." },
    stickyCta: {
      title: "Ready to create something strong?",
      description: "Tell me the work you need and I'll reply with the best direction.",
      buttonLabel: "Book",
    },
  },
  about: {
    creativePosition: {
      label: "Creative position",
      paragraph:
        "The portfolio is not only a gallery. It is a connected platform for visual work, client inquiries, private delivery, testimonials, people profiles, services, and selected digital experiments.",
    },
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
    approach: {
      label: "Approach",
      heading: "High-end work needs direction, not decoration.",
      paragraph:
        "The visual language is built around controlled atmosphere, strong subject presence, clean composition, and details that feel intentional from the first image to the final delivery.",
    },
    principles: {
      label: "Principles",
      items: [
        "Cinematic presentation without losing honesty or intimacy.",
        "Creative direction that treats every subject as part of a larger visual world.",
        "Clean systems behind the work, so galleries, people, services, and inquiries stay connected.",
        "Premium execution across public presentation, private delivery, and client communication.",
      ],
    },
    closingCta: {
      label: "Work together",
      heading: "Build a visual direction with weight, rhythm, and identity.",
      paragraph:
        "Start with photography, film, private galleries, NFT artwork, dance-led visuals, or a complete digital presentation system.",
    },
  },
  dancing: {
    movementLanguage: {
      label: "Movement language",
      paragraph:
        "Dance informs both the performance work and the camera work: timing, weight, pauses, transitions, and the emotional shape of movement.",
    },
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
    direction: {
      label: "Direction",
      heading: "Dance as performance, archive, and visual identity.",
      paragraph:
        "This section connects movement-based work with the wider HM Visuals practice: cinematic video, performance documentation, creative collaborations, and teaching material.",
    },
    workCovered: {
      label: "Work covered",
      items: [
        "Performance films and movement-led visual pieces.",
        "Festival, rehearsal, and behind-the-scenes dance coverage.",
        "Teaching, workshops, and class documentation.",
        "Creative collaborations where motion becomes the visual language.",
      ],
    },
    closingCta: {
      label: "Movement-led visuals",
      heading: "Create dance work with cinematic direction.",
      paragraph:
        "Build a performance film, document a class or festival, or shape a collaboration around movement.",
    },
  },
  "web-development": {
    creativeTechnology: {
      label: "Creative technology",
      paragraph:
        "Visual design, content structure, client experience, and technical execution working together inside one focused digital system.",
    },
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
    technicalDirection: {
      label: "Technical direction",
      heading: "Interfaces with structure, not just surface.",
      paragraph:
        "The work focuses on systems that make creative content easier to present, manage, search, connect, and deliver with a premium public experience.",
    },
    buildPrinciples: {
      label: "Build principles",
      items: [
        "Design and code should serve the same visual identity.",
        "Admin systems should make content easier to manage, not harder to understand.",
        "Reusable components should replace duplicated one-off UI blocks.",
        "Public presentation should feel intentional, cinematic, and premium.",
      ],
    },
    closingCta: {
      label: "Creative digital work",
      heading: "Build a visual system that feels as strong as the work it holds.",
      paragraph:
        "Create a portfolio, interface, admin system, or digital presentation layer with clear structure and high-end visual direction.",
    },
  },
  blog: {
    editorialDirection: {
      label: "Editorial direction",
      paragraph:
        "A focused space for stories behind the work, creative decisions, locations, movement, atmosphere, and visual identity.",
    },
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
