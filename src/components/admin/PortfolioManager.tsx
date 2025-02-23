'use client';

import { useState, useEffect } from 'react';
import { PortfolioItem, PortfolioCategory } from '@/types/portfolio';
import { getPortfolioItems, addPortfolioItem, updatePortfolioItem, deletePortfolioItem } from '@/lib/firebase/portfolio';

interface PortfolioManagerProps {
  category: PortfolioCategory;
}

export default function PortfolioManager({ category }: PortfolioManagerProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [category]);

  const loadItems = async () => {
    try {
      const loadedItems = await getPortfolioItems(category);
      setItems(loadedItems);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      if (editingId) {
        await updatePortfolioItem(category, editingId, {
          title,
          description,
          updatedAt: Date.now(),
        });
      } else {
        await addPortfolioItem(category, {
          title,
          description,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      setTitle('');
      setDescription('');
      setEditingId(null);
      await loadItems();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setTitle(item.title);
    setDescription(item.description);
    setEditingId(item.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deletePortfolioItem(category, id);
      await loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 capitalize">{category} Items</h2>
      
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-2 border rounded"
            rows={3}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingId ? 'Update Item' : 'Add Item'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setTitle('');
              setDescription('');
            }}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border p-4 rounded">
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleEdit(item)}
                className="text-blue-500 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 