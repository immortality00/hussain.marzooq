export const LOADING_LINES = [
  "Developing in the darkroom. Door stays shut.",
  "Waiting for the light to cooperate.",
  "Still in hair and makeup.",
  "One more take.",
  "Five, six, seven, eight —",
  "Pulling focus.",
  "The negatives are still drying.",
  "Waiting for the cloud to pass.",
  "Rewinding the reel.",
  "Setting the lights. Hold still.",
] as const;

export const LOADING_LINE_MS = 2600;

export function loadingLine(index: number): string {
  const count = LOADING_LINES.length;
  return LOADING_LINES[((Math.trunc(index) % count) + count) % count];
}
