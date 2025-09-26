'use client';

import { WindowFrame } from '@/components/WindowFrame';
import { AppProvider } from '@/contexts/AppContext';
import { ServerList } from './ServerList';
import { ChannelList } from './ChannelList';
import { FriendsList } from './FriendsList';
import { ChatArea } from '@/features/chat/ChatArea';
import { ThreadView } from '@/features/chat/ThreadView';
import { SearchView } from '@/features/chat/SearchView';
import { UserProfileModal } from './UserProfileModal';
import { useAppContext } from '@/contexts/AppContext'; // Import useAppContext

export interface MainPageProps {
  onLogout: () => void;
}

function MainContent({ onLogout }: MainPageProps) {
  const { threadStack, viewMode, isSearching } = useAppContext(); // Access threadStack, viewMode, and isSearching

  return (
    <WindowFrame title='Synob App' onClose={onLogout}>
      <UserProfileModal />
      <div className='flex h-full bg-gray-800 text-white'>
        <ServerList />
        {viewMode === 'server' ? <ChannelList onLogout={onLogout} /> : <FriendsList />}
        <div className='flex-1 flex bg-gray-800 relative'>
          {/* ChatArea container */}
          <div className={`${threadStack.length > 0 || isSearching ? 'w-[60%]' : 'flex-1 w-full'}`}>
            <ChatArea />
          </div>
          {/* ThreadView container */}
          {threadStack.length > 0 && !isSearching && (
            <div className='w-[40%]'>
              <ThreadView />
            </div>
          )}
          {/* SearchView container */}
          {isSearching && (
            <div className='w-[40%]'>
              <SearchView />
            </div>
          )}
        </div>
      </div>
    </WindowFrame>
  );
}

export function MainPage({ onLogout }: MainPageProps) {
  return (
    <AppProvider>
      <MainContent onLogout={onLogout} />
    </AppProvider>
  );
}
