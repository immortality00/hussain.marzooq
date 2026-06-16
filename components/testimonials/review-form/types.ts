export type WidgetResult = { info?: unknown };

export type LocationOption = {
  id: string;
  label: string;
  lat: number;
  lon: number;
  countryCode: string | null;
  population: number | null;
  source: "dataset" | "fallback";
};

export type BannerState = { type: "ok" | "err"; text: string } | null;