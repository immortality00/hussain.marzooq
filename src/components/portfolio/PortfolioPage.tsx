'use client';

import { PortfolioCategory } from '@/types/portfolio';
import PortfolioGrid from './PortfolioGrid';

interface PortfolioPageProps {
  category: PortfolioCategory;
  title: string;
  description: string;
}

export default function PortfolioPage({ category, title, description }: PortfolioPageProps) {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">{title}</h1>
        <p className="text-gray-600 mb-8">{description}</p>
        <PortfolioGrid category={category} />
      </div>
    </main>
  );
} 