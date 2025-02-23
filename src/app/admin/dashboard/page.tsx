'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAuthProtection } from '@/lib/hooks/useAuthProtection';
import Link from 'next/link';
import PortfolioManager from '@/components/admin/PortfolioManager';
import { PortfolioCategory } from '@/types/portfolio';

interface AdminSection {
  title: string;
  description: string;
  path: string;
  icon: string;
}

const adminSections: AdminSection[] = [
  {
    title: 'Photography',
    description: 'Manage your photography portfolio',
    path: '/admin/photography',
    icon: '📸',
  },
  {
    title: 'Films',
    description: 'Update your film projects',
    path: '/admin/films',
    icon: '🎬',
  },
  {
    title: 'Web Development',
    description: 'Showcase your web projects',
    path: '/admin/webdev',
    icon: '💻',
  },
  {
    title: 'NFTs',
    description: 'Manage your NFT collections',
    path: '/admin/nfts',
    icon: '🎨',
  },
  {
    title: 'Dance',
    description: 'Update dance performances',
    path: '/admin/dance',
    icon: '💃',
  },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { loading } = useAuthProtection();
  const [selectedCategory, setSelectedCategory] = useState<PortfolioCategory>('photography');

  const categories: PortfolioCategory[] = ['photography', 'film', 'webdev', 'nfts', 'dance'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-600">
                {user?.email}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0 mb-8">
          <h2 className="text-2xl font-bold mb-4">Welcome back!</h2>
          <p className="text-gray-600">
            Manage your portfolio content from this dashboard.
          </p>
        </div>

        {/* Content Management Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
          {adminSections.map((section) => (
            <Link
              key={section.path}
              href={section.path}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="text-3xl mb-4">{section.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                <p className="text-gray-600 text-sm">{section.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats Section */}
        <div className="mt-8 px-4 sm:px-0">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">0</div>
                <div className="text-gray-600 text-sm">Total Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">0</div>
                <div className="text-gray-600 text-sm">Total Photos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">0</div>
                <div className="text-gray-600 text-sm">Total Films</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 px-4 sm:px-0">
          <h2 className="text-xl font-semibold mb-3">Portfolio Management</h2>
          <div className="flex space-x-2 mb-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded capitalize ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <PortfolioManager category={selectedCategory} />
      </main>
    </div>
  );
} 