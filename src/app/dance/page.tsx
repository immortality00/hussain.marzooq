import PortfolioGrid from '@/components/portfolio/PortfolioGrid';

export default function DancePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Dance Performances</h1>
        <p className="text-gray-600 mb-8">
          A collection of dance performances, choreographies, and artistic expressions through movement.
        </p>
        <PortfolioGrid category="dance" />
      </div>
    </main>
  );
} 