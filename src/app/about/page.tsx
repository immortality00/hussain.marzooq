'use client';

import AboutBio from '@/components/sections/AboutBio';
import AboutMilestones from '@/components/sections/AboutMilestones';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black">
      <AboutBio />
      <AboutMilestones />
    </main>
  );
} 