'use client';

import { LockScreen } from '@/components/LockScreen';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    router.push('/desktop');
  };

  // Check if already logged in on client side
  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      router.push('/desktop');
    }
  }, [router]);

  return (
    <>
      <LockScreen onLogin={handleLogin} />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-nature-800 text-sm backdrop-blur-sm text-white font-semibold rounded-md shadow-lg transition-colors"
        >
          Login (Dev Only)
        </button>
      </div>
    </>
  );
}
