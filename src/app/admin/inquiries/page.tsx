'use client';

import { useState, useEffect } from 'react';
import { useAuthProtection } from '@/lib/hooks/useAuthProtection';
import { Inquiry } from '@/types/contact';
import { getInquiries, updateInquiryStatus, deleteInquiry } from '@/lib/firebase/inquiries';

export default function InquiriesPage() {
  useAuthProtection(); // Protect the route

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInquiries();
      setInquiries(data);
    } catch (err) {
      console.error('Error loading inquiries:', err);
      setError('Failed to load inquiries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: Inquiry['status']) => {
    try {
      setActionInProgress(id);
      await updateInquiryStatus(id, status);
      setInquiries(prev =>
        prev.map(inquiry =>
          inquiry.id === id
            ? { ...inquiry, status, updatedAt: Date.now() }
            : inquiry
        )
      );
    } catch (err) {
      console.error('Error updating inquiry:', err);
      alert('Failed to update inquiry status. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
      return;
    }

    try {
      setActionInProgress(id);
      await deleteInquiry(id);
      setInquiries(prev => prev.filter(inquiry => inquiry.id !== id));
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      alert('Failed to delete inquiry. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Loading inquiries...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Error</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Contact Form Submissions</h1>
        
        {inquiries.length === 0 ? (
          <p className="text-gray-600">No inquiries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-sm rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dance Style
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inquiry.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inquiry.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inquiry.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inquiry.danceStyle || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          inquiry.status === 'new'
                            ? 'bg-green-100 text-green-800'
                            : inquiry.status === 'archived'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {inquiry.status === 'new' && (
                          <button
                            onClick={() => handleStatusUpdate(inquiry.id, 'archived')}
                            disabled={actionInProgress === inquiry.id}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Archive
                          </button>
                        )}
                        {inquiry.status === 'archived' && (
                          <button
                            onClick={() => handleStatusUpdate(inquiry.id, 'new')}
                            disabled={actionInProgress === inquiry.id}
                            className="text-green-600 hover:text-green-900"
                          >
                            Restore
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(inquiry.id)}
                          disabled={actionInProgress === inquiry.id}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 