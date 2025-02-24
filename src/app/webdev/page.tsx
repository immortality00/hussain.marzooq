import PortfolioGrid from '@/components/portfolio/PortfolioGrid';

export default function WebDevPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Web Development Projects</h1>
        <p className="text-gray-600 mb-8">
          A collection of web applications and sites showcasing modern development practices.
        </p>
        <PortfolioGrid category="webdev" />
      </div>
    </main>
  );
} 