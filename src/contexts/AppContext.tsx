'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS, INITIAL_MESSAGES } from '@/lib/mockData';
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
}

// 2. Create Context
const AppContext = createContext<AppContextType | null>(null);

// 3. Provider Component
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser] = useState<User>({ id: 1 as UserId, name: 'Me', avatar: 'M' });
  const [users] = useState<{ [id: number]: User }>(INITIAL_USERS);
  const [messages, setMessages] = useState<{ [key: number]: Message[] }>(INITIAL_MESSAGES);
  const [viewMode, setViewMode] = useState<'server' | 'friends'>('server');

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const serverManagement = useServerManagement(setMessages, setIsSearching, setSearchQuery);
  const { selectedChannel, selectedServer } = serverManagement;

  const messageManagement = useMessageManagement(currentUser, selectedChannel, messages, setMessages, users);
  const { messagesEndRef } = messageManagement;

  const searchManagement = useSearchManagement(selectedServer, messages, currentUser, isSearching, setIsSearching, searchQuery);
  const { searchResults } = searchManagement;

  const uiManagement = useUIManagement();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChannel, searchResults, messagesEndRef]);

  const value = {
    ...serverManagement,
    ...messageManagement,
    ...searchManagement,
    ...uiManagement,
    currentUser, users, messages, setMessages, viewMode, setViewMode,
    isSearching, setIsSearching, searchQuery, setSearchQuery,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// 4. Custom Hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};