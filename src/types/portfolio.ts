export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface CategoryMetadata {
  id: string;
  aboutText: string;
  lastUpdated: number;
}

export type PortfolioCategory = 'photography' | 'film' | 'webdev' | 'nfts' | 'dance'; 