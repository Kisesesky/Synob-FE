'use client';

import { ChannelList } from './ChannelList';
import { FriendsList } from './FriendsList';
import { ChatArea } from '@/features/chat/ChatArea';
import { ThreadView } from '@/features/chat/ThreadView';
import { SearchView } from '@/features/chat/SearchView';
import { UserProfileModal } from './UserProfileModal';
import { AddFriendDialog } from './AddFriendDialog';
import { PinnedMessagesPanel } from './PinnedMessagesPanel';
import { AnnouncementsPanel } from './AnnouncementsPanel';
import { NotificationsPanel } from './NotificationsPanel';
import { SettingsModal } from './SettingsModal';
import { useAppContext } from '@/contexts/AppContext';

export interface MainPageProps {
  onLogout: () => void;
}

export function MainPage({ onLogout }: MainPageProps) {
  const { threadStack, viewMode, isSearching, isPinnedMessagesOpen, isAnnouncementsOpen, isNotificationsOpen, isSettingsModalOpen, setIsSettingsModalOpen } = useAppContext();

  const isAnyPanelOpen = threadStack.length > 0 || isSearching || isPinnedMessagesOpen || isAnnouncementsOpen || isNotificationsOpen;

  return (
    <div className='flex flex-row flex-1 h-full'>
      {viewMode === 'server' ? <ChannelList onLogout={onLogout} /> : <FriendsList />}
      <div className='flex-1 flex flex-col bg-white dark:bg-gray-800 text-black dark:text-white min-h-0 h-full'>
        <div className={`flex-1 flex bg-gray-200 dark:bg-gray-700 relative h-full`}>
          <div className={`h-full ${isAnyPanelOpen ? 'w-[60%]' : 'flex-1 w-full'}`}>
            <ChatArea />
          </div>
          {threadStack.length > 0 && (
            <div className='w-[40%] h-full'>
              <ThreadView />
            </div>
          )}
          {isSearching && (
            <div className='w-[40%] h-full'>
              <SearchView />
            </div>
          )}
          {isPinnedMessagesOpen && (
            <PinnedMessagesPanel />
          )}
          {isAnnouncementsOpen && (
            <AnnouncementsPanel />
          )}
          {isNotificationsOpen && (
            <NotificationsPanel />
          )}
        </div>
      </div>
      <UserProfileModal />
      <AddFriendDialog />
      <SettingsModal open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen} />
    </div>
  );
}