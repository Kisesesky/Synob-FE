import { WindowFrame } from '@/components/WindowFrame';
import { ServerList } from './ServerList';
import { MainPage } from './MainPage';
import { useBackground } from '@/lib/useBackground';

export function Desktop({ onLogout }: { onLogout: () => void }) {
  const { background, isLoading } = useBackground();

  if (isLoading) {
    return <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div 
      className="w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: background?.type === 'photo' ? `url(${background.url})` : undefined }}
    >
      {background?.type === 'video' && (
        <video autoPlay loop muted className="absolute top-0 left-0 w-full h-full object-cover z-[-1]">
          <source src={background.url} type="video/mp4" />
        </video>
      )}
      <WindowFrame title="Slack" onClose={onLogout}>
        <MainPage onLogout={onLogout} />
      </WindowFrame>
      <ServerList />
    </div>
  );
}