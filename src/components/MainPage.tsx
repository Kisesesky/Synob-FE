'use client';

import { ChannelList } from './ChannelList';
import { FriendsList } from './FriendsList';
import { ChatArea } from '@/features/chat/ChatArea';
import { ThreadView } from '@/features/chat/ThreadView';
import { SearchView } from '@/features/chat/SearchView';
import { UserProfileModal } from './UserProfileModal';
import { useAppContext } from '@/contexts/AppContext';

export interface MainPageProps {
  onLogout: () => void;
}

export function MainPage({ onLogout }: MainPageProps) {
  const { threadStack, viewMode, isSearching } = useAppContext();

  return (
    <div className='flex flex-row flex-1 h-full'>
      {viewMode === 'server' ? <ChannelList onLogout={onLogout} /> : <FriendsList />}
      <div className='flex-1 flex flex-col bg-gray-800 text-white min-h-0 h-full'>
        <div className={`flex-1 flex bg-gray-700 relative h-full`}>
          <div className={`h-full ${threadStack.length > 0 || isSearching ? 'w-[60%]' : 'flex-1 w-full'}`}>
            <ChatArea />
          </div>
          {threadStack.length > 0 && !isSearching && (
            <div className='w-[40%] h-full'>
              <ThreadView />
            </div>
          )}
          {isSearching && (
            <div className='w-[40%] h-full'>
              <SearchView />
            </div>
          )}
        </div>
      </div>
      <UserProfileModal />
    </div>
  );
}