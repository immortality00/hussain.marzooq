import { SITE_EMAIL } from "@/lib/site-emails";

// The licence every token minted from the site carries. Its text is pinned to IPFS and linked
// from the token's final metadata, so it can never change for a token already registered:
// any edit here is a new version (bump LICENCE_VERSION). test/nft/licences.test.ts pins the
// text's hash so an accidental edit fails.

export const LICENCE_VERSION = "1.0";
export const LICENCE_NAME = `Hussain.Art Collector Licence v${LICENCE_VERSION}`;
export const LICENCE_FILE_NAME = `hussain-art-collector-licence-v${LICENCE_VERSION}.txt`;

const CLAUSES: [string, string][] = [
  [
    "Who this is between",
    "The Artist is Hussain Marzooq. The Artwork is the photograph or film this token points to. You are the lawful owner of the token, or of a copy of it in an edition. Owning the token means you accept this licence. A token taken by theft or fraud carries no rights.",
  ],
  [
    "What you own",
    "You own the token. The Artist keeps the copyright and every right not given to you here.",
  ],
  [
    "Display rights (every owner)",
    [
      "Worldwide, free of royalties and non-exclusive, you may:",
      "- display the Artwork privately and publicly, online, in virtual spaces and in exhibitions, as long as it is not commercial;",
      "- make one physical print for your own display, not for sale;",
      "- show the Artwork to offer the token for sale;",
      "- keep backup copies.",
    ].join("\n"),
  ],
  [
    "Commercial rights (only while the token carries the commercial rights mark in the Artist's contract)",
    "You may also use the Artwork on products, merchandise, advertising, publications and media that you sell or use in business, up to USD 100,000 of gross revenue in a calendar year in total. You may crop and resize it to fit a format. Printers and manufacturers may act for you. These rights are non-exclusive. Anything above the limit needs a written agreement with the Artist.",
  ],
  [
    "Never allowed",
    [
      "You may not:",
      "- alter the Artwork or make new works from it, beyond the cropping and resizing in clause 4;",
      "- mint or tokenise the Artwork or anything made from it;",
      "- use it to train, prompt or build AI systems or AI-generated content;",
      "- register it as a trademark, or claim to be its author;",
      "- pass any of these rights to someone else apart from the token;",
      "- use it, alone or with anything else, for: discrimination or hate speech against any person or group; pornographic or sexualised content; promoting violence, self-harm or terrorism; harassment, bullying or defamation; misleading content, scams or impersonation; or anything unlawful where it is used.",
    ].join("\n"),
  ],
  [
    "People shown in the Artwork",
    [
      "You may display the Artwork as a whole. You may not:",
      "- crop, isolate, edit or alter a person's face or body, or combine them with other images;",
      "- use a person's image, likeness or voice for AI content, deepfakes or avatars;",
      "- present a person as endorsing anything, or as having any belief, health condition, sexuality, religion or political view;",
      "- name, tag, locate or contact a person shown, or try to find out who they are, unless they made that public themselves.",
    ].join("\n"),
  ],
  ["Credit", 'Credit "Hussain Marzooq" wherever it is reasonably possible.'],
  [
    "Selling or transferring",
    "These rights belong to the token. When you transfer it, all your rights end at once and the new owner receives them, commercial rights included if the token carries the mark. You then have 60 days to sell products already made, and may make no new ones. Burning the token ends the licence. A token split into shares or held by a group gives display rights only.",
  ],
  [
    "The Artist's promises",
    "The Artist will not withdraw this licence while you keep to it, and will not mint this Artwork as another token beyond its stated edition. The Artist may still exhibit, publish, print and sell the Artwork as a photographer, and license it to others.",
  ],
  [
    "Breach",
    "If you break this licence and do not fix it within 30 days of being told, it ends. A breach of the harmful-use rule in clause 5 or of clause 6 ends it at once.",
  ],
  [
    "No guarantees",
    "The Artwork and token come as they are. The Artist's liability is limited to the price you paid the Artist.",
  ],
  [
    "This text",
    `The English text governs. This version is fixed for this token and cannot change. Contact: ${SITE_EMAIL.hussain}.`,
  ],
];

export const LICENCE_TEXT = [
  LICENCE_NAME,
  "",
  ...CLAUSES.flatMap(([title, body], index) => [`${index + 1}. ${title}`, body, ""]),
].join("\n");

/** The short statement written into a token's `rights` field. */
export function rightsStatement(year: number) {
  return `© ${year} Hussain Marzooq. ${LICENCE_NAME}.`;
}
