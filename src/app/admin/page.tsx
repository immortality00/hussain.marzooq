'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to dashboard
    router.replace('/admin/dashboard');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
      <div className="text-center">
        <div className="text-2xl font-display">Redirecting to dashboard...</div>
        <div className="mt-4 flex justify-center space-x-2">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="w-2 h-2 bg-blue-400 rounded-full"
              style={{
                animation: `pulse 1.5s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
} 