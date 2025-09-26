'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { INITIAL_SERVERS, INITIAL_USERS, INITIAL_MESSAGES } from '@/lib/mockData';
import type { Server, User, Message, Channel, Category } from '@/lib/types';

// 1. Context Type
interface AppContextType {
  // State
  servers: Server[];
  setServers: React.Dispatch<React.SetStateAction<Server[]>>;
  currentUser: User;
  users: { [id: number]: User };
  messages: { [key: number]: Message[] };
  setMessages: React.Dispatch<React.SetStateAction<{[key: number]: Message[]}>>;
  selectedServer: Server;
  setSelectedServer: React.Dispatch<React.SetStateAction<Server>>;
  selectedChannel: Channel | null;
  setSelectedChannel: React.Dispatch<React.SetStateAction<Channel | null>>;
  openCategories: { [key: number]: boolean };
  unreadChannels: { [key: number]: boolean };
  notificationSettings: { [channelId: number]: 'all' | 'mentions' | 'none' };
  threadStack: Message[];
  dmChannels: { [userId: number]: Channel };
  selectedDmChannel: Channel | null;
  currentMessage: string;
  setCurrentMessage: React.Dispatch<React.SetStateAction<string>>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  viewingUser: User | null;
  setViewingUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAddServerDialogOpen: boolean;
  setIsAddServerDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newServerName: string;
  setNewServerName: React.Dispatch<React.SetStateAction<string>>;
  isAddCategoryDialogOpen: boolean;
  setIsAddCategoryDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newCategoryName: string;
  setNewCategoryName: React.Dispatch<React.SetStateAction<string>>;
  isAddChannelDialogOpen: boolean;
  setIsAddChannelDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newChannelName: string;
  setNewChannelName: React.Dispatch<React.SetStateAction<string>>;
  searchSenderId: number | null;
  setSearchSenderId: React.Dispatch<React.SetStateAction<number | null>>;
  searchStartDate: string | null;
  setSearchStartDate: React.Dispatch<React.SetStateAction<string | null>>;
  searchEndDate: string | null;
  setSearchEndDate: React.Dispatch<React.SetStateAction<string | null>>;
  searchChannelId: number | null;
  setSearchChannelId: React.Dispatch<React.SetStateAction<number | null>>;
  excludeMyMessages: boolean;
  setExcludeMyMessages: React.Dispatch<React.SetStateAction<boolean>>;
  onlyMyMessages: boolean;
  setOnlyMyMessages: React.Dispatch<React.SetStateAction<boolean>>;
  searchOffset: number;
  setSearchOffset: React.Dispatch<React.SetStateAction<number>>;
  searchLimit: number;
  hasMoreSearchResults: boolean;
  setHasMoreSearchResults: React.Dispatch<React.SetStateAction<boolean>>;
  isSearching: boolean;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchResults: Message[];
  contextMenu: { type: string; id: string | number } | null;
  setContextMenu: React.Dispatch<React.SetStateAction<{ type: string; id: string | number } | null>>;
  editingMessageId: number | null;
  editedMessageText: string;
  setEditedMessageText: React.Dispatch<React.SetStateAction<string>>;
  editingServer: Server | null;
  isEditServerDialogOpen: boolean;
  setIsEditServerDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editedServerName: string;
  setEditedServerName: React.Dispatch<React.SetStateAction<string>>;
  editingCategory: Category | null;
  isEditCategoryDialogOpen: boolean;
  setIsEditCategoryDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editedCategoryName: string;
  setEditedCategoryName: React.Dispatch<React.SetStateAction<string>>;
  editingChannel: Channel | null;
  isEditChannelDialogOpen: boolean;
  setIsEditChannelDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editedChannelName: string;
  setEditedChannelName: React.Dispatch<React.SetStateAction<string>>;
  replyingToMessage: Message | null;
  setReplyingToMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  viewMode: 'server' | 'friends';
  setViewMode: React.Dispatch<React.SetStateAction<'server' | 'friends'>>;
  // Handlers
  handleSearch: () => void;
  handleChannelSelect: (channel: Channel) => void;
  handleServerSelect: (server: Server) => void;
  toggleCategory: (categoryId: number) => void;
  addServer: () => void;
  handleAddCategory: () => void;
  handleAddChannel: () => void;
  handleEditServer: () => void;
  handleEditCategory: () => void;
  handleEditChannel: () => void;
  handleDeleteChannel: (channelId: number) => void;
  handleDeleteCategory: (categoryId: number) => void;
  handleSendMessage: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleStartEditMessage: (message: Message) => void;
  handleCancelEditMessage: () => void;
  handleSaveEditMessage: () => void;
  handleDeleteMessage: (messageId: number) => void;
  handleReaction: (messageId: number, emoji: string) => void;
  handleNotificationChange: (channelId: number, setting: 'all' | 'mentions' | 'none') => void;
  handleOpenThread: (message: Message) => void;
  handleOpenNestedThread: (message: Message) => void;
  handleCloseThread: () => void;
  handleGoBackInThread: () => void;
  handleReplyInThread: (replyText: string) => void;
  handleFileUploadInThread: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleReactionInThread: (messageId: number, emoji: string) => void;
  handleCancelReply: () => void;
  loadMoreSearchResults: () => void;
  openAddCategoryDialog: () => void;
  openAddChannelDialog: (categoryId: number) => void;
}

// 2. Create Context
const AppContext = createContext<AppContextType | null>(null);

// 3. Provider Component
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [servers, setServers] = useState<Server[]>(INITIAL_SERVERS);
  const [currentUser] = useState<User>({ id: 1, name: 'Me', avatar: 'M' });
  const [users] = useState<{ [id: number]: User }>(INITIAL_USERS);
  const [messages, setMessages] = useState<{ [key: number]: Message[] }>(INITIAL_MESSAGES);

  const [selectedServer, setSelectedServer] = useState<Server>(
    servers[0] ?? { id: 0, name: 'Default', icon: 'D', categories: [] }
  );
  
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(
    servers[0]?.categories?.[0]?.channels?.[0] ?? null
  );
  
  const [openCategories, setOpenCategories] = useState<{[key: number]: boolean}>({1: true, 2: true, 3: true});
  const [unreadChannels, setUnreadChannels] = useState<{[key: number]: boolean}>({});
  const [notificationSettings, setNotificationSettings] = useState<{[channelId: number]: 'all' | 'mentions' | 'none'}>({});
  const [threadStack, setThreadStack] = useState<Message[]>([]);
  const [dmChannels, setDmChannels] = useState<{ [userId: number]: Channel }>({});
  const [selectedDmChannel, setSelectedDmChannel] = useState<Channel | null>(null);

  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isAddServerDialogOpen, setIsAddServerDialogOpen] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddChannelDialogOpen, setIsAddChannelDialogOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);
  const [searchSenderId, setSearchSenderId] = useState<number | null>(null);
  const [searchStartDate, setSearchStartDate] = useState<string | null>(null);
  const [searchEndDate, setSearchEndDate] = useState<string | null>(null);
  const [searchChannelId, setSearchChannelId] = useState<number | null>(null);
  const [excludeMyMessages, setExcludeMyMessages] = useState<boolean>(false);
  const [onlyMyMessages, setOnlyMyMessages] = useState<boolean>(false);
  const [searchOffset, setSearchOffset] = useState<number>(0);
  const [searchLimit] = useState<number>(20); // Messages per load
  const [hasMoreSearchResults, setHasMoreSearchResults] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [contextMenu, setContextMenu] = useState<{ type: string; id: string | number } | null>(null);

  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [isEditServerDialogOpen, setIsEditServerDialogOpen] = useState(false);
  const [editedServerName, setEditedServerName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [isEditChannelDialogOpen, setIsEditChannelDialogOpen] = useState(false);
  const [editedChannelName, setEditedChannelName] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editedMessageText, setEditedMessageText] = useState('');
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [viewMode, setViewMode] = useState<'server' | 'friends'>('server');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChannel, searchResults]);

  const handleSearch = useCallback((append: boolean = false) => {
    if (searchQuery.trim() === '' && !searchSenderId && !searchStartDate && !searchEndDate && !searchChannelId && !excludeMyMessages && !onlyMyMessages) {
      setIsSearching(false);
      setSearchResults([]);
      setHasMoreSearchResults(false);
      return;
    }

    setIsSearching(true);

    const allFilteredResults: Message[] = [];

    // Flatten all messages from all channels in the selected server
    selectedServer.categories.forEach(category => {
      category.channels.forEach(channel => {
        const channelMessages = messages[channel.id] || [];
        channelMessages.forEach(msg => {
          // Apply filters
          let match = true;

          // Text query filter
          if (searchQuery.trim() !== '' && !msg.text?.toLowerCase().includes(searchQuery.toLowerCase())) {
            match = false;
          }

          // Sender filter
          if (searchSenderId !== null && msg.authorId !== searchSenderId) {
            match = false;
          }

          // Date range filter
          if (searchStartDate || searchEndDate) {
            const messageDate = new Date(msg.timestamp).setHours(0, 0, 0, 0);
            if (searchStartDate) {
              const start = new Date(searchStartDate).setHours(0, 0, 0, 0);
              if (messageDate < start) match = false;
            }
            if (searchEndDate) {
              const end = new Date(searchEndDate).setHours(23, 59, 59, 999);
              if (messageDate > end) match = false;
            }
          }

          // Channel filter
          if (searchChannelId !== null && msg.channelId !== searchChannelId) {
            match = false;
          }

          // Exclude my messages
          if (excludeMyMessages && msg.authorId === currentUser.id) {
            match = false;
          }

          // Only my messages
          if (onlyMyMessages && msg.authorId !== currentUser.id) {
            match = false;
          }

          if (match) {
            allFilteredResults.push({ ...msg, channelId: channel.id });
          }
        });
      });
    });

    // Sort results by timestamp (newest first)
    allFilteredResults.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const currentOffset = append ? searchOffset : 0;
    const newOffset = currentOffset + searchLimit;
    const paginatedResults = allFilteredResults.slice(0, newOffset);

    setSearchResults(paginatedResults);
    setSearchOffset(newOffset);
    setHasMoreSearchResults(newOffset < allFilteredResults.length);

    if (!append) {
      // If it's a new search, reset offset and set initial results
      setSearchOffset(searchLimit);
    }

  }, [searchQuery, searchSenderId, searchStartDate, searchEndDate, searchChannelId, excludeMyMessages, onlyMyMessages, selectedServer, messages, currentUser.id, searchLimit, searchOffset]);

  const loadMoreSearchResults = useCallback(() => {
    handleSearch(true);
  }, [handleSearch]);

  const handleChannelSelect = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
    setUnreadChannels(prev => ({ ...prev, [channel.id]: false }));
    setIsSearching(false);
    setSearchQuery('');
  }, []);

  const handleServerSelect = useCallback((server: Server) => {
    setSelectedServer(server);
    if (server.categories.length > 0 && server.categories[0].channels.length > 0) {
      handleChannelSelect(server.categories[0].channels[0]);
    } else {
      setSelectedChannel(null);
    }
  }, [handleChannelSelect]);

  const toggleCategory = useCallback((categoryId: number) => {
    setOpenCategories(prev => ({...prev, [categoryId]: !prev[categoryId]}));
  }, []);

  const addServer = useCallback(() => {
    if (newServerName.trim() === '') {
      return;
    }
    const newServer: Server = { id: Date.now(), name: newServerName, icon: newServerName.charAt(0).toUpperCase(), categories: [] };
    setServers(prev => [...prev, newServer]);
    setNewServerName('');
    setIsAddServerDialogOpen(false);
  }, [newServerName]);

  const handleAddCategory = useCallback(() => {
    if (newCategoryName.trim() === '' || !selectedServer) {
      return;
    }
    const newCategory: Category = { id: Date.now(), name: newCategoryName, channels: [] };
    setServers(prev => prev.map(s => s.id === selectedServer.id ? { ...s, categories: [...s.categories, newCategory] } : s));
    setNewCategoryName('');
    setIsAddCategoryDialogOpen(false);
  }, [newCategoryName, selectedServer]);

  const handleAddChannel = useCallback(() => {
    if (newChannelName.trim() === '' || currentCategoryId === null) {
      return;
    }
    const newChannel: Channel = { id: Date.now(), name: newChannelName };
    setServers(prev => prev.map(server => {
      if (server.id === selectedServer.id) {
        const updatedCategories = server.categories.map(category => {
          if (category.id === currentCategoryId) {
            return { ...category, channels: [...category.channels, newChannel] };
          }
          return category;
        });
        return { ...server, categories: updatedCategories };
      }
      return server;
    }));
    setMessages(prev => ({...prev, [newChannel.id]: []}));
    setNewChannelName('');
    setIsAddChannelDialogOpen(false);
    setCurrentCategoryId(null);
  }, [newChannelName, currentCategoryId, selectedServer?.id]);

  const handleEditServer = useCallback(() => {
    if (!editingServer || editedServerName.trim() === '') {
      return;
    }
    setServers(prev => prev.map(s => s.id === editingServer.id ? { ...s, name: editedServerName } : s));
    if (selectedServer.id === editingServer.id) {
      setSelectedServer(prev => ({ ...prev!, name: editedServerName }));
    }
    setIsEditServerDialogOpen(false);
  }, [editingServer, editedServerName, selectedServer?.id]);
  
  const handleEditCategory = useCallback(() => {
    if (!editingCategory || editedCategoryName.trim() === '') {
      return;
    }
    setServers(prev => prev.map(server => ({
      ...server,
      categories: server.categories.map(c => c.id === editingCategory.id ? { ...c, name: editedCategoryName } : c),
    })));
    setIsEditCategoryDialogOpen(false);
  }, [editingCategory, editedCategoryName]);
  
  const handleEditChannel = useCallback(() => {
    if (!editingChannel || editedChannelName.trim() === '') {
      return;
    }
    setServers(prev => prev.map(server => ({
      ...server,
      categories: server.categories.map(category => ({
        ...category,
        channels: category.channels.map(c => c.id === editingChannel.id ? { ...c, name: editedChannelName } : c),
      })),
    })));
    setIsEditChannelDialogOpen(false);
  }, [editingChannel, editedChannelName]);

  const handleDeleteChannel = useCallback((channelId: number) => {
    if (!window.confirm('정말로 이 채널을 삭제하시겠습니까?')) {
      return;
    }
    setServers(prev => prev.map(server => ({
      ...server,
      categories: server.categories.map(category => ({
        ...category,
        channels: category.channels.filter(c => c.id !== channelId)
    }))
  })));
    if (selectedChannel?.id === channelId) {
      const firstChannel = servers.find(s => s.id === selectedServer.id)?.categories[0]?.channels[0];
      setSelectedChannel(firstChannel || null);
    }
  }, [selectedChannel, selectedServer, servers]);

  const handleDeleteCategory = useCallback((categoryId: number) => {
    if (!window.confirm('정말로 이 카테고리를 삭제하시겠습니까? 카테고리 안의 모든 채널이 삭제됩니다.')) {
      return;
    }
    setServers(prev => prev.map(server => ({
      ...server,
      categories: server.categories.filter(c => c.id !== categoryId)
    })));
  }, []);

  const handleSendMessage = useCallback(() => {
    if (currentMessage.trim() === '' || !selectedChannel) {
      return;
    }
    const newMessage: Message = {
      id: Date.now(),
      authorId: currentUser.id,
      text: currentMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...(replyingToMessage && { repliedToMessageId: replyingToMessage.id }), // Add repliedToMessageId if replyingToMessage is set
    };
    setMessages(prev => ({ ...prev, [selectedChannel.id]: [...(prev[selectedChannel.id] || []), newMessage] }));
    setCurrentMessage('');
    setReplyingToMessage(null); // Clear replyingToMessage after sending
  }, [currentMessage, selectedChannel, currentUser.id, replyingToMessage]); // Add replyingToMessage to dependencies

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedChannel) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const newFileMessage: Message = {
        id: Date.now(),
        authorId: currentUser.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        file: {
          name: file.name,
          type: file.type,
          url: e.target?.result as string,
        }
      };
      setMessages(prev => ({ ...prev, [selectedChannel.id]: [...(prev[selectedChannel.id] || []), newFileMessage] }));
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
        const newFileMessage: Message = {
          id: Date.now(),
          authorId: currentUser.id,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          file: { name: file.name, type: file.type, url: '' } 
        };
      setMessages(prev => ({ ...prev, [selectedChannel.id]: [...(prev[selectedChannel.id] || []), newFileMessage] }));
    }
    event.target.value = '';
  }, [selectedChannel, currentUser.id]);

  const handleStartEditMessage = useCallback((message: Message) => {
    if (message.authorId !== currentUser.id) {
      return;
    }
    setEditingMessageId(message.id);
    setEditedMessageText(message.text || '');
  }, [currentUser.id]);

  const handleCancelEditMessage = useCallback(() => {
    setEditingMessageId(null);
    setEditedMessageText('');
  }, []);

  const handleSaveEditMessage = useCallback(() => {
    if (editingMessageId === null || !selectedChannel) {
      return;
    }
    setMessages(prev => ({
      ...prev,
      [selectedChannel.id]: prev[selectedChannel.id].map(msg =>
        msg.id === editingMessageId ? { ...msg, text: editedMessageText } : msg
      ),
    }));
    setEditingMessageId(null);
    setEditedMessageText('');
  }, [editingMessageId, selectedChannel, editedMessageText]);

  const handleDeleteMessage = useCallback((messageId: number) => {
    if (!selectedChannel || !window.confirm('정말로 이 메시지를 삭제하시겠습니까?')) {
      return;
    }
    setMessages(prev => ({
      ...prev,
      [selectedChannel.id]: prev[selectedChannel.id].filter(msg => msg.id !== messageId),
    }));
  }, [selectedChannel]);

  const handleReaction = useCallback((messageId: number, emoji: string) => {
    if (!selectedChannel) {
      return;
    }
    setMessages(prev => ({
      ...prev,
      [selectedChannel.id]: prev[selectedChannel.id].map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...(msg.reactions || {}) };
          const userList = reactions[emoji] || [];
          if (userList.includes(currentUser.id)) {
            reactions[emoji] = userList.filter(id => id !== currentUser.id);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          } else {
            reactions[emoji] = [...userList, currentUser.id];
          }
          return { ...msg, reactions };
        }
          return msg;
      }),
    }));
  }, [selectedChannel, currentUser.id]);

  const handleNotificationChange = useCallback((channelId: number, setting: 'all' | 'mentions' | 'none') => {
    setNotificationSettings(prev => ({ ...prev, [channelId]: setting }));
  }, []);

  const handleOpenThread = useCallback((message: Message) => {
    setThreadStack([message]);
  }, []);

  const handleOpenNestedThread = useCallback((message: Message) => {
    setThreadStack(prev => [...prev, message]);
  }, []);

  const handleCloseThread = useCallback(() => {
    setThreadStack([]);
    setReplyingToMessage(null); // Also clear reply state
  }, []);

  const handleGoBackInThread = useCallback(() => {
    setThreadStack(prev => prev.slice(0, -1));
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingToMessage(null);
  }, []);

  // Helper function to recursively find and update a message
  const updateMessageRecursively = (messages: Message[], targetId: number, updateFn: (message: Message) => Message): Message[] => {
    return messages.map(msg => {
      if (msg.id === targetId) {
        return updateFn(msg);
      }
      if (msg.thread) {
        const updatedThread = updateMessageRecursively(msg.thread, targetId, updateFn);
        if (updatedThread !== msg.thread) {
          return { ...msg, thread: updatedThread };
        }
      }
      return msg;
    });
  };

  const handleReplyInThread = useCallback((replyText: string) => {
    const currentThread = threadStack[threadStack.length - 1];
    if (!currentThread || !selectedChannel) {
      return;
    }
    const newReply: Message = {
      id: Date.now(),
      authorId: currentUser.id,
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...(replyingToMessage && { repliedToMessageId: replyingToMessage.id }),
    };

    const updateFn = (messageToUpdate: Message) => ({
      ...messageToUpdate,
      thread: [...(messageToUpdate.thread || []), newReply],
    });

    setMessages(prev => ({
      ...prev,
      [selectedChannel.id]: updateMessageRecursively(prev[selectedChannel.id], currentThread.id, updateFn),
    }));

    setThreadStack(prev => {
      const newStack = [...prev];
      const updatedCurrentThread = updateFn(currentThread);
      newStack[newStack.length - 1] = updatedCurrentThread;
      return newStack;
    });

    setReplyingToMessage(null); // Clear reply state after sending
  }, [threadStack, selectedChannel, currentUser.id, messages, replyingToMessage]);

  const handleFileUploadInThread = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const currentThread = threadStack[threadStack.length - 1];
    if (!file || !currentThread || !selectedChannel) {
      return;
    }

    const processFile = (fileUrl: string) => {
      const newFileMessage: Message = {
        id: Date.now(),
        authorId: currentUser.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        file: { name: file.name, type: file.type, url: fileUrl },
      };

      const updateFn = (messageToUpdate: Message) => ({
        ...messageToUpdate,
        thread: [...(messageToUpdate.thread || []), newFileMessage],
      });

      setMessages(prev => ({
        ...prev,
        [selectedChannel.id]: updateMessageRecursively(prev[selectedChannel.id], currentThread.id, updateFn),
      }));

      setThreadStack(prev => {
        const newStack = [...prev];
        const updatedCurrentThread = updateFn(currentThread);
        newStack[newStack.length - 1] = updatedCurrentThread;
        return newStack;
      });
    };

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        processFile(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      processFile('');
    }
    event.target.value = '';
  }, [threadStack, selectedChannel, currentUser.id, messages]);

  const handleReactionInThread = useCallback((messageId: number, emoji: string) => {
    const currentThread = threadStack[threadStack.length - 1];
    if (!currentThread || !selectedChannel) {
      return;
    }

    const updateFn = (messageToReact: Message) => {
      const reactions = { ...(messageToReact.reactions || {}) };
      const userList = reactions[emoji] || [];
      if (userList.includes(currentUser.id)) {
        reactions[emoji] = userList.filter(id => id !== currentUser.id);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      } else {
        reactions[emoji] = [...userList, currentUser.id];
      }
      return { ...messageToReact, reactions };
    };

    setMessages(prev => ({
      ...prev,
      [selectedChannel.id]: updateMessageRecursively(prev[selectedChannel.id], currentThread.id, (threadMessage) => ({
        ...threadMessage,
        thread: updateMessageRecursively(threadMessage.thread || [], messageId, updateFn),
      })),
    }));

    setThreadStack(prev => {
      const newStack = [...prev];
      const updatedCurrentThread = {
        ...currentThread,
        thread: updateMessageRecursively(currentThread.thread || [], messageId, updateFn),
      };
      newStack[newStack.length - 1] = updatedCurrentThread;
      return newStack;
    });
  }, [threadStack, selectedChannel, currentUser.id, messages]);

  const openAddCategoryDialog = () => setIsAddCategoryDialogOpen(true);
  const openAddChannelDialog = (categoryId: number) => {
    setCurrentCategoryId(categoryId);
    setIsAddChannelDialogOpen(true);
  };
  const openEditServerDialog = (server: Server) => {
    setEditingServer(server);
    setEditedServerName(server.name);
    setIsEditServerDialogOpen(true);
  };
  const openEditCategoryDialog = (category: Category) => {
    setEditingCategory(category);
    setEditedCategoryName(category.name);
    setIsEditCategoryDialogOpen(true);
  };
  const openEditChannelDialog = (channel: Channel) => {
    setEditingChannel(channel);
    setEditedChannelName(channel.name);
    setIsEditChannelDialogOpen(true);
  };

  const value = {
    servers, setServers, currentUser, users, messages, setMessages, selectedServer, setSelectedServer, selectedChannel, setSelectedChannel, openCategories, unreadChannels, notificationSettings, threadStack, dmChannels, setDmChannels, selectedDmChannel, setSelectedDmChannel, viewMode, setViewMode, currentMessage, setCurrentMessage, messagesEndRef, fileInputRef, viewingUser, setViewingUser, isAddServerDialogOpen, setIsAddServerDialogOpen, newServerName, setNewServerName, isAddCategoryDialogOpen, setIsAddCategoryDialogOpen, newCategoryName, setNewCategoryName, isAddChannelDialogOpen, setIsAddChannelDialogOpen, newChannelName, setNewChannelName, searchSenderId, setSearchSenderId, searchStartDate, setSearchStartDate, searchEndDate, setSearchEndDate, searchChannelId, setSearchChannelId, excludeMyMessages, setExcludeMyMessages, onlyMyMessages, setOnlyMyMessages, searchOffset, setSearchOffset, searchLimit, hasMoreSearchResults, setHasMoreSearchResults, isSearching, setIsSearching, searchQuery, setSearchQuery, searchResults, contextMenu, setContextMenu, editingMessageId, editedMessageText, setEditedMessageText, editingServer, isEditServerDialogOpen, setIsEditServerDialogOpen, editedServerName, setEditedServerName, editingCategory, isEditCategoryDialogOpen, setIsEditCategoryDialogOpen, editedCategoryName, setEditedCategoryName, editingChannel, isEditChannelDialogOpen, setIsEditChannelDialogOpen, editedChannelName, setEditedChannelName, replyingToMessage, setReplyingToMessage, handleSearch, handleChannelSelect, handleServerSelect, toggleCategory, addServer, handleAddCategory, handleAddChannel, handleEditServer, handleEditCategory, handleEditChannel, handleDeleteChannel, handleDeleteCategory, handleSendMessage, handleFileUpload, handleStartEditMessage, handleCancelEditMessage, handleSaveEditMessage, handleDeleteMessage, handleReaction, handleNotificationChange, handleOpenThread, handleOpenNestedThread, handleCloseThread, handleGoBackInThread, handleReplyInThread, handleFileUploadInThread, handleReactionInThread, handleCancelReply, loadMoreSearchResults, openAddCategoryDialog, openAddChannelDialog, openEditServerDialog, openEditCategoryDialog, openEditChannelDialog
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