const WORDS_PER_MINUTE = 200;

export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 1;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function readingTimeLabel(text: string): string {
  return `${readingMinutes(text)} min read`;
}
