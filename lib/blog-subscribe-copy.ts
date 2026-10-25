/** The blog's sign-up box wording. Edited in Pages → Blog. */
export type SubscribeCopy = { heading: string; text: string; buttonLabel: string; confirmation: string };

export const DEFAULT_SUBSCRIBE_COPY: SubscribeCopy = {
  heading: "Notes from the darkroom.",
  text: "New stories from behind the lens, sent the moment they’re published — nothing else.",
  buttonLabel: "Keep me posted",
  confirmation: "Almost there — check your inbox to confirm.",
};

const FIELDS: { key: keyof SubscribeCopy; label: string; max: number }[] = [
  { key: "heading", label: "Subscribe heading", max: 120 },
  { key: "text", label: "Subscribe line", max: 400 },
  { key: "buttonLabel", label: "Subscribe button label", max: 40 },
  { key: "confirmation", label: "Subscribe confirmation", max: 200 },
];

/** The wording as stored, trimmed. A field that is not text or is too long is refused by name. */
export function subscribeCopyForSave(value: unknown): { subscribe: SubscribeCopy } | { error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { error: "Subscribe wording must be an object." };
  const source = value as Record<string, unknown>;
  const subscribe = { ...DEFAULT_SUBSCRIBE_COPY };
  for (const { key, label, max } of FIELDS) {
    const field = source[key] ?? "";
    if (typeof field !== "string") return { error: `${label} must be text.` };
    if (field.trim().length > max) return { error: `${label} is over ${max} characters.` };
    subscribe[key] = field.trim();
  }
  return { subscribe };
}

/**
 * What the site shows. A blank heading or line is not shown; a blank button label or confirmation falls back to the
 * default, because a button with no words or a silent success would be broken.
 */
export function publishedSubscribeCopy(value: unknown): SubscribeCopy {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const text = (key: keyof SubscribeCopy) => (typeof source[key] === "string" ? (source[key] as string).trim() : null);
  return {
    heading: text("heading") ?? DEFAULT_SUBSCRIBE_COPY.heading,
    text: text("text") ?? DEFAULT_SUBSCRIBE_COPY.text,
    buttonLabel: text("buttonLabel") || DEFAULT_SUBSCRIBE_COPY.buttonLabel,
    confirmation: text("confirmation") || DEFAULT_SUBSCRIBE_COPY.confirmation,
  };
}
