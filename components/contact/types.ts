export type ServiceItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  startingPrice: number | null;
  currency: string;
};

export type ServiceMode = "select" | "other";
export type CategoryMode = "select" | "other";