export type PrivacySectionContent = { heading: string; body: string[] };

export type Processor = { name: string; purpose: string; data: string };

export const PRIVACY_SECTIONS: PrivacySectionContent[] = [
  {
    heading: "What this site collects",
    body: [
      "Nothing is collected until you send it. Browsing the work — photography, film, NFT, dance, writing — requires no account, and there is no advertising or profiling on this site.",
      "The booking form collects your name, email, message, and the service or category you picked, so the enquiry can be answered.",
      "A review submitted from the testimonials page collects your name, email, an optional description of who you are, an optional city, your rating, the review text, and any photos you upload. Reviews are published only after approval, and only with the consent you tick when submitting. Your email is never published.",
      "A private client gallery sets one cookie in your browser when you enter its password, so the gallery stays open while you use it. A password-protected profile page works the same way. Neither cookie carries personal data, and neither is used for tracking.",
    ],
  },
  {
    heading: "How long it is kept",
    body: [
      "Enquiries and reviews are kept in the site's database for as long as they are useful for the work — an enquiry as a record of the project, a review as long as it is published.",
      "Photos attached to a review that is never submitted are deleted when you close the form. Photos in a published review live in Cloudinary alongside it.",
      "Analytics counts are aggregate pageview numbers with no visitor record behind them, so there is nothing tied to you to delete.",
    ],
  },
  {
    heading: "Analytics",
    body: [
      "Visits are counted with GoatCounter, which is cookieless and stores no personal data and no cross-site identifier. It records the page, the referring site, and coarse browser information. There is no Google Analytics, no advertising pixel, and no tracking that follows you to other sites — which is also why this site shows no cookie banner.",
    ],
  },
  {
    heading: "Embedded content",
    body: [
      "Some pages embed content served by other companies: an OpenStreetMap map on the testimonials page, YouTube (in no-cookie mode) and Vimeo players where a film is hosted there, and Instagram posts on the dancing page. When one of those loads, that company receives your IP address and can set its own cookies under its own privacy policy. Nothing on this site sends them your name, email, or anything you have typed.",
      "The preview images on the web development page are not loaded from a third party by your browser, so nothing tracks you through them.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      "You can ask for your enquiry or review to be corrected or deleted, ask for a published review to be taken down, or ask what is held about you. Write to hussain.marzooq.bh@icloud.com and it will be handled.",
      "If you appear in the work and want your profile page made private or removed, the request form on your profile page goes straight to the same place.",
    ],
  },
];

export const PROCESSORS: Processor[] = [
  {
    name: "MongoDB Atlas",
    purpose: "Database hosting — enquiries, reviews, and site content.",
    data: "Everything you submit through a form on this site.",
  },
  {
    name: "Cloudinary",
    purpose: "Image and video hosting and delivery.",
    data: "Photos and films, including any photo you attach to a review.",
  },
  {
    name: "Netlify",
    purpose: "Web hosting and delivery.",
    data: "Standard server logs, including your IP address.",
  },
  {
    name: "Resend",
    purpose: "Sends the notification email when a form is submitted.",
    data: "The name, email, and message on that submission.",
  },
  {
    name: "GoatCounter",
    purpose: "Cookieless visit counting.",
    data: "Page visited, referring site, coarse browser information. No cookie, no identifier.",
  },
  {
    name: "OpenStreetMap",
    purpose: "The map embedded on the testimonials page.",
    data: "Your IP address, when that map loads.",
  },
  {
    name: "YouTube (no-cookie) and Vimeo",
    purpose: "Video players for films hosted there.",
    data: "Your IP address, when a player loads.",
  },
  {
    name: "Instagram",
    purpose: "Post embeds on the dancing page.",
    data: "Your IP address, when an embed loads.",
  },
];
