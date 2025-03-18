import React from 'react';
import Link from 'next/link';

const ExampleCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="bg-black/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-gold-400">{title}</h3>
      <div>{children}</div>
    </div>
  );
};

export default function GoldAnimationExamples() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-orange-400 mb-2">
        Gold Animation Examples
      </h1>
      <p className="text-gray-300 mb-8 text-lg">
        Reference examples of the gold animation classes available in the portfolio.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gold Shimmer */}
        <ExampleCard title="Gold Shimmer Effect">
          <p className="gold-shimmer text-white px-4 py-3 rounded-md inline-block bg-black/40">
            Hover to see shimmer effect
          </p>
        </ExampleCard>

        {/* Gold Border Pulse */}
        <ExampleCard title="Gold Border Pulse">
          <div className="gold-border-pulse px-6 py-4 rounded-md inline-block bg-black/40 text-white">
            Watch the pulsing border
          </div>
        </ExampleCard>

        {/* Gold Hover Glow */}
        <ExampleCard title="Gold Hover Glow">
          <button className="gold-hover-glow px-6 py-3 rounded-md bg-black/40 text-white border border-gold-500/30">
            Hover for gold glow
          </button>
        </ExampleCard>

        {/* Gold Button 3D */}
        <ExampleCard title="Gold 3D Button">
          <button className="gold-button-3d px-6 py-3 rounded-md bg-gradient-to-r from-gold-500 to-orange-500 text-white">
            3D Gold Button
          </button>
        </ExampleCard>

        {/* Gold Particles */}
        <ExampleCard title="Gold Particles Effect">
          <div className="gold-particles p-6 rounded-md bg-black/40 text-white">
            Hover for particles effect
          </div>
        </ExampleCard>

        {/* Gold Active State */}
        <ExampleCard title="Gold Active Indicator">
          <div className="flex gap-4">
            <button className="gold-active px-4 py-2 text-white">
              Normal
            </button>
            <button className="gold-active active px-4 py-2 text-white">
              Active
            </button>
          </div>
        </ExampleCard>

        {/* Gold Glass */}
        <ExampleCard title="Gold Glass Effect">
          <div className="gold-glass p-4 rounded-md text-white">
            Gold glass panel
          </div>
        </ExampleCard>

        {/* Gold Glass with Accent Border */}
        <ExampleCard title="Gold Glass with Accent Border">
          <div className="gold-glass gold-accent-border p-4 rounded-md text-white">
            With accent border
          </div>
        </ExampleCard>

        {/* Gold Glass Hover */}
        <ExampleCard title="Gold Glass Hover Effect">
          <div className="gold-glass-hover p-4 rounded-md text-white bg-black/40">
            Hover for gold glass effect
          </div>
        </ExampleCard>
      </div>

      <div className="mt-12 text-center">
        <Link href="/admin/GOLD_THEME_GUIDELINES.md" className="px-6 py-3 bg-gradient-to-r from-gold-500 to-orange-500 rounded-md text-white gold-hover-glow">
          View Full Gold Theme Guidelines
        </Link>
      </div>
    </div>
  );
} 