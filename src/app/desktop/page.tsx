'use client';

import { Desktop } from '@/components/Desktop';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DesktopPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  // Check if not logged in on client side
  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      router.push('/login');
    }
  }, [router]);

  return <Desktop onLogout={handleLogout} />;
}
