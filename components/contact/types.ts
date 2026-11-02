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
/** What a booking link puts in the address: `?service=`, `?category=`, `?context=`. */
export type ContactPrefill = { service: string; category: string; context: string };

export type ServiceChoice = {
  serviceMode: ServiceMode;
  serviceId: string;
  otherService: string;
  categoryMode: CategoryMode;
  selectedCategory: string;
  otherCategory: string;
};
