'use client';

import { useState, useEffect } from 'react';
import { PortfolioCategory, CategoryMetadata } from '@/types/portfolio';
import { getCategoryMetadata, updateCategoryMetadata } from '@/lib/firebase/portfolio';

interface CategoryMetadataEditorProps {
  category: PortfolioCategory;
}

export default function CategoryMetadataEditor({ category }: CategoryMetadataEditorProps) {
  const [aboutText, setAboutText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setLoading(true);
        setError(null);
        const metadata = await getCategoryMetadata(category);
        if (metadata) {
          setAboutText(metadata.aboutText);
        }
      } catch (err) {
        console.error('Error loading category metadata:', err);
        setError('Failed to load category information.');
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSaveMessage(null);

      await updateCategoryMetadata(category, {
        aboutText,
        lastUpdated: Date.now(),
      });

      setSaveMessage('Category information saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Error saving category metadata:', err);
      setError('Failed to save category information.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4">About This Category</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="aboutText" className="block text-sm font-medium text-gray-700 mb-2">
            Category Description
          </label>
          <textarea
            id="aboutText"
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            className="w-full p-3 border rounded-md"
            rows={4}
            placeholder={`Write a description for the ${category} category...`}
          />
        </div>

        {error && (
          <div className="mb-4 text-red-600 text-sm">{error}</div>
        )}

        {saveMessage && (
          <div className="mb-4 text-green-600 text-sm">{saveMessage}</div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Description'}
        </button>
      </form>
    </div>
  );
} 