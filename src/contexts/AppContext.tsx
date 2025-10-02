'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_MESSAGES, INITIAL_SERVERS } from '@/lib/mockData';
import type { User, Message } from '@/lib/types';
import { useServerManagement } from '@/hooks/useServerManagement';
import { useMessageManagement } from '@/hooks/useMessageManagement';
import { useSearchManagement } from '@/hooks/useSearchManagement';
import { useUIManagement } from '@/hooks/useUIManagement';
import type { UserId } from '@/lib/brandedTypes';

// Define the return type of the custom hooks for better type inference
type UseServerManagementReturn = ReturnType<typeof useServerManagement>;
type UseMessageManagementReturn = ReturnType<typeof useMessageManagement>;
type UseSearchManagementReturn = ReturnType<typeof useSearchManagement>;
type UseUIManagementReturn = ReturnType<typeof useUIManagement>;

export interface AppContextType extends UseServerManagementReturn, UseMessageManagementReturn, UseSearchManagementReturn, UseUIManagementReturn {
  // Global State
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  users: { [id: number]: User };
  messages: { [key: number]: Message[] };
  setMessages: React.Dispatch<React.SetStateAction<{[key: number]: Message[]}>>;
  viewMode: 'server' | 'friends';
  setViewMode: React.Dispatch<React.SetStateAction<'server' | 'friends'>>;
  isSearching: boolean;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// 2. Create Context
const AppContext = createContext<AppContextType>({} as AppContextType);

// 3. Provider Component
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 1 as UserId,
    fullName: '호야',
    nickname: '나',
    email: 'me@example.com',
    phoneNumber: '010-1111-2222',
    avatarUrl: 'https://i.pinimg.com/736x/22/8a/da/228adaff2bc066e8fc04218bf72e5225.jpg',
    backgroundImage: 'https://i.pinimg.com/1200x/ec/8f/43/ec8f43e45eb96934836ae8494f2fd6d8.jpg',
    status: '온라인',
    aboutMe: '안녕하세요! 슬랙봇입니다. 무엇을 도와드릴까요?',
    lockScreenPassword: 'password123', // 실제 앱에서는 해싱된 비밀번호를 사용해야 합니다.
    friendIds: [2 as UserId],
    incomingFriendRequests: [3 as UserId]
  });
  const [messages, setMessages] = useState<{ [key: number]: Message[] }>(INITIAL_MESSAGES);
  const [viewMode, setViewMode] = useState<'server' | 'friends'>('server');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Provide a default user if currentUser is null for hooks that expect User
  const userForHooks = currentUser || {
    id: 0 as UserId, // A dummy ID for when currentUser is null
    fullName: 'Guest',
    nickname: 'Guest',
    email: '',
    phoneNumber: '',
    avatarUrl: '',
    backgroundImage: '',
    status: 'Offline',
    aboutMe: '',
    lockScreenPassword: '',
    friendIds: [],
    incomingFriendRequests: []
  };

  const searchManagement = useSearchManagement(INITIAL_SERVERS[0], messages, userForHooks);
  const { setIsSearching, setSearchQuery } = searchManagement;

  const serverManagement = useServerManagement(setMessages, setIsSearching, setSearchQuery);
  const { selectedChannel } = serverManagement;

  const messageManagement = useMessageManagement(userForHooks, selectedChannel, messages, setMessages);
  const { messagesEndRef, users, setUsers } = messageManagement;

  const uiManagement = useUIManagement();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChannel, messagesEndRef]);

  const value = {
    ...serverManagement,
    ...messageManagement,
    ...searchManagement,
    ...uiManagement,
    currentUser, setCurrentUser, users, setUsers, messages, setMessages, viewMode, setViewMode,
    isSettingsModalOpen, setIsSettingsModalOpen,
  };

  return (
    <AppContext.Provider value={value as AppContextType}>
      {children}
    </AppContext.Provider>
  );
};

// 4. Custom Hook
export const useAppContext = () => {
  return useContext(AppContext);
};