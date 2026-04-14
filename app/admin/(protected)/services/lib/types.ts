export type Service = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  startingPrice: number | null;
  currency: string;
  imageUrl: string;
  isActive: boolean;
  isArchived: boolean;
  order: number;
  inquiriesCount: number;
};

export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
};