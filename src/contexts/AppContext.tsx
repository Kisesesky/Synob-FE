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

// 1. Context Type
export interface AppContextType extends UseServerManagementReturn, UseMessageManagementReturn, UseSearchManagementReturn, UseUIManagementReturn {
  // Global State
  currentUser: User;
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
  const [currentUser] = useState<User>({ id: 1 as UserId, name: 'Me', avatar: 'M', status: 'Online', friendIds: [2 as UserId], incomingFriendRequests: [3 as UserId] });
  const [messages, setMessages] = useState<{ [key: number]: Message[] }>(INITIAL_MESSAGES);
  const [viewMode, setViewMode] = useState<'server' | 'friends'>('server');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const searchManagement = useSearchManagement(INITIAL_SERVERS[0], messages, currentUser);
  const { setIsSearching, setSearchQuery } = searchManagement;

  const serverManagement = useServerManagement(setMessages, setIsSearching, setSearchQuery);
  const { selectedChannel } = serverManagement;

  const messageManagement = useMessageManagement(currentUser, selectedChannel, messages, setMessages);
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
    currentUser, users, setUsers, messages, setMessages, viewMode, setViewMode,
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