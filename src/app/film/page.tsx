import PortfolioGrid from '@/components/portfolio/PortfolioGrid';

export default function FilmPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Film Projects</h1>
        <p className="text-gray-600 mb-8">
          A showcase of my cinematic work, from short films to documentaries.
        </p>
        <PortfolioGrid category="film" />
      </div>
    </main>
  );
} 