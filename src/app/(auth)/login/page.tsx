'use client';

import { LockScreen } from '@/components/LockScreen';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    router.push('/dashboard');
  };

  // Check if already logged in on client side
  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      router.push('/dashboard');
    }
  }, [router]);

  return <LockScreen onLogin={handleLogin} />;
}
