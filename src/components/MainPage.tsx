'use client';

import { Button } from '@/components/ui/button';
import { WindowFrame } from '@/components/WindowFrame';

interface MainPageProps {
  onLogout: () => void;
}

export function MainPage({ onLogout }: MainPageProps) {
  return (
    <WindowFrame title="Main Application" onClose={onLogout}>
      <div className="flex min-h-full flex-col items-center justify-center p-24 text-white">
        <h1 className="text-5xl font-bold mb-8">Welcome to the Main Page!</h1>
        <p className="text-lg mb-8">You have successfully logged in.</p>
        <Button onClick={onLogout} variant="secondary">Logout</Button>
      </div>
    </WindowFrame>
  );
}
