export type PortfolioCategory = 'photography' | 'film' | 'webdev' | 'nfts' | 'dance';

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: PortfolioCategory;
  imageUrl?: string;
  videoUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  tags: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryMetadata {
  id: string;
  category: PortfolioCategory;
  title: string;
  description: string;
  icon: string;
  featured: boolean;
  order: number;
}

export interface PortfolioResponse {
  items: PortfolioItem[];
  error: string | null;
}

export interface CategoryResponse {
  metadata: CategoryMetadata | null;
  error: string | null;
} 