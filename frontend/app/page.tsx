'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getAuthUser();
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">載入中...</div>
    </div>
  );
}