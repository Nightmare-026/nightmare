'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DownloadPage() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchAndDownload = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`${API_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success && data.data.fileUrl) {
          // Increment download count (optional, but handled in backend verify-payment for paid ones)
          // For free ones, we might want to increment too.
          
          // Redirect to Cloudinary URL
          window.location.href = data.data.fileUrl;
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Download failed:', error);
        router.push('/dashboard');
      }
    };

    fetchAndDownload();
  }, [id, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
      <p className="text-slate-400 font-medium">Preparing your download...</p>
      <p className="text-slate-500 text-sm mt-2">You will be redirected in a moment.</p>
    </div>
  );
}
