export type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
  servicesCount: number;
  isSystem: boolean;
};

export type CategoryPatch = Partial<Pick<Category, "name" | "slug" | "isActive" | "order">>;