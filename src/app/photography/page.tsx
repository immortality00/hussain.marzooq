import PortfolioGrid from '@/components/portfolio/PortfolioGrid';

export default function PhotographyPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Photography Portfolio</h1>
        <p className="text-gray-600 mb-8">
          Explore my collection of photographs, capturing moments and stories through the lens.
        </p>
        <PortfolioGrid category="photography" />
      </div>
    </main>
  );
} 