'use client';

import { WindowFrame } from '@/components/WindowFrame';
import { ServerList } from './ServerList';
import { MainPage } from './MainPage';

export function Desktop({ onLogout }: { onLogout: () => void }) {
  return (
    <div 
      className="w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/img/KakaoTalk_20250926_181103507.jpg')" }}
    >
      <WindowFrame title="Slack" onClose={onLogout}>
        <MainPage onLogout={onLogout} />
      </WindowFrame>
      <ServerList />
    </div>
  );
}