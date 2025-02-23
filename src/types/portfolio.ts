export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export type PortfolioCategory = 'photography' | 'film' | 'webdev' | 'nfts' | 'dance'; 