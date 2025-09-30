import { useState, useCallback } from 'react';
import type { Server, Channel, Category, Message } from '@/lib/types';
import { INITIAL_SERVERS } from '@/lib/mockData';
import type { ServerId, CategoryId, ChannelId } from '@/lib/brandedTypes';

export const useServerManagement = (
  setMessages: React.Dispatch<React.SetStateAction<{[key: number]: Message[]}>>,
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>,
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
) => {
  const [servers, setServers] = useState<Server[]>(INITIAL_SERVERS);
  const [selectedServer, setSelectedServer] = useState<Server>(
    servers[0] ?? { id: 0 as ServerId, name: 'Default', icon: 'D', categories: [] }
  );
  
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(
    servers[0]?.categories?.[0]?.channels?.[0] ?? null
  );
  
  const [openCategories, setOpenCategories] = useState<{[key: number]: boolean}>({1: true, 2: true, 3: true});
  const [unreadChannels, setUnreadChannels] = useState<{[key: number]: boolean}>({});
  const [notificationSettings, setNotificationSettings] = useState<{[channelId: number]: 'all' | 'mentions' | 'none'}>({});

  const [isAddServerDialogOpen, setIsAddServerDialogOpen] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddChannelDialogOpen, setIsAddChannelDialogOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [currentCategoryId, setCurrentCategoryId] = useState<CategoryId | null>(null);

  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [isEditServerDialogOpen, setIsEditServerDialogOpen] = useState(false);
  const [editedServerName, setEditedServerName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [isEditChannelDialogOpen, setIsEditChannelDialogOpen] = useState(false);
  const [editedChannelName, setEditedChannelName] = useState('');

  const handleChannelSelect = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
    setUnreadChannels(prev => ({ ...prev, [channel.id]: false }));
    setIsSearching(false);
    setSearchQuery('');
  }, [setIsSearching, setSearchQuery]);

  const handleServerSelect = useCallback((server: Server) => {
    setSelectedServer(server);
    if (server.categories.length > 0 && server.categories[0].channels.length > 0) {
      handleChannelSelect(server.categories[0].channels[0]);
    } else {
      setSelectedChannel(null);
    }
  }, [handleChannelSelect]);

  const toggleCategory = useCallback((categoryId: CategoryId) => {
    setOpenCategories(prev => ({...prev, [categoryId]: !prev[categoryId]}));
  }, []);

  const addServer = useCallback(() => {
    if (newServerName.trim() === '') {
      return;
    }
    const newServer: Server = { id: Date.now() as ServerId, name: newServerName, icon: newServerName.charAt(0).toUpperCase(), categories: [] };
    setServers(prev => [...prev, newServer]);
    setNewServerName('');
    setIsAddServerDialogOpen(false);
  }, [newServerName]);

  const handleAddCategory = useCallback(() => {
    if (newCategoryName.trim() === '' || !selectedServer) {
      return;
    }
    const newCategory: Category = { id: Date.now() as CategoryId, name: newCategoryName, channels: [] };
    setServers(prev => prev.map(s => s.id === selectedServer.id ? { ...s, categories: [...s.categories, newCategory] } : s));
    setNewCategoryName('');
    setIsAddCategoryDialogOpen(false);
  }, [newCategoryName, selectedServer]);

  const handleAddChannel = useCallback(() => {
    if (newChannelName.trim() === '' || currentCategoryId === null) {
      return;
    }
    const newChannel: Channel = { id: Date.now() as ChannelId, name: newChannelName };
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
  }, [newChannelName, currentCategoryId, selectedServer?.id, setMessages]);

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

  const handleDeleteChannel = useCallback((channelId: ChannelId) => {
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

  const handleDeleteCategory = useCallback((categoryId: CategoryId) => {
    if (!window.confirm('정말로 이 카테고리를 삭제하시겠습니까? 카테고리 안의 모든 채널이 삭제됩니다.')) {
      return;
    }
    setServers(prev => prev.map(server => ({
      ...server,
      categories: server.categories.filter(c => c.id !== categoryId)
    })));
  }, []);

  const handleNotificationChange = useCallback((channelId: ChannelId, setting: 'all' | 'mentions' | 'none') => {
    setNotificationSettings(prev => ({ ...prev, [channelId]: setting }));
  }, []);

  const openAddCategoryDialog = () => setIsAddCategoryDialogOpen(true);
  const openAddChannelDialog = (categoryId: CategoryId) => {
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

  return {
    servers, setServers,
    selectedServer, setSelectedServer,
    selectedChannel, setSelectedChannel,
    openCategories,
    unreadChannels,
    notificationSettings,
    isAddServerDialogOpen, setIsAddServerDialogOpen,
    newServerName, setNewServerName,
    isAddCategoryDialogOpen, setIsAddCategoryDialogOpen,
    newCategoryName, setNewCategoryName,
    isAddChannelDialogOpen, setIsAddChannelDialogOpen,
    newChannelName, setNewChannelName,
    editingServer,
    isEditServerDialogOpen, setIsEditServerDialogOpen,
    editedServerName, setEditedServerName,
    editingCategory,
    isEditCategoryDialogOpen, setIsEditCategoryDialogOpen,
    editedCategoryName, setEditedCategoryName,
    editingChannel,
    isEditChannelDialogOpen, setIsEditChannelDialogOpen,
    editedChannelName, setEditedChannelName,
    handleChannelSelect,
    handleServerSelect,
    toggleCategory,
    addServer,
    handleAddCategory,
    handleAddChannel,
    handleEditServer,
    handleEditCategory,
    handleEditChannel,
    handleDeleteChannel,
    handleDeleteCategory,
    handleNotificationChange,
    openAddCategoryDialog,
    openAddChannelDialog,
    openEditServerDialog,
    openEditCategoryDialog,
    openEditChannelDialog,
  };
};