import PortfolioGrid from '@/components/portfolio/PortfolioGrid';

export default function NFTsPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">NFT Collections</h1>
        <p className="text-gray-600 mb-8">
          Explore my digital art and NFT collections, bridging creativity with blockchain technology.
        </p>
        <PortfolioGrid category="nfts" />
      </div>
    </main>
  );
} 