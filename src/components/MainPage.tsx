'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent,
  DropdownMenuSubTrigger, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WindowFrame } from '@/components/WindowFrame';
import { ThreadView } from './ThreadView';
import { UserProfileModal } from './UserProfileModal';

import { 
  BellOff, ChevronDown, ChevronRight, File as FileIcon, Hash,
  MessageSquare as MessageSquareIcon, Plus, Settings 
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Image from "next/image";

export interface MainPageProps {
  onLogout: () => void;
}

export interface Channel {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  channels: Channel[];
}

export interface Server {
  id: number;
  name: string;
  icon: string;
  categories: Category[];
}

export interface User {
  id: number;
  name: string;
  avatar: string;
}

export interface Message {
  id: number;
  text?: string;
  authorId: number;
  timestamp: string;
  file?: { name: string; type: string; url: string; };
  reactions?: { [emoji: string]: number[] };
  thread?: Message[];
  channelId?: number;
}

export function MainPage({ onLogout }: MainPageProps) {
  // STATE
  const [servers, setServers] = useState<Server[]>([
    {
      id: 1,
      name: 'Synology',
      icon: 'SY',
      categories: [
        { id: 1, name: '일반', channels: [{ id: 1, name: '채팅' }, { id: 2, name: '공지사항' }] },
        { id: 2, name: '개발', channels: [{ id: 3, name: '프론트엔드' }, { id: 4, name: '백엔드' }] },
      ],
    },
    {
      id: 2,
      name: 'Next.js',
      icon: 'N',
      categories: [
        { id: 3, name: 'Documentation', channels: [{ id: 5, name: 'getting-started' }, { id: 6, name: 'routing' }] },
      ],
    },
  ]);

  const [currentUser, setCurrentUser] = useState<User>({ id: 1, name: "Me", avatar: "M" });

  const [users, setUsers] = useState<{[id: number]: User}>({
    1: { id: 1, name: "Me", avatar: "M" },
    2: { id: 2, name: "Gemini", avatar: "G" },
    3: { id: 3, name: "Admin", avatar: "A" },
    4: { id: 4, name: "User1", avatar: "U" },
  });

  const [messages, setMessages] = useState<{[key: number]: Message[]}>({
    1: [
      {id: 1, authorId: 2, text: "안녕하세요! Synology 서버의 채팅 채널에 오신 것을 환영합니다.", timestamp: "10:00", reactions: {'👍': [2, 3, 4]}},
      {id: 2, authorId: 1, text: "안녕하세요!", timestamp: "10:01"},
      {id: 3, authorId: 1, text: "이 기능은 메시지 그룹핑 테스트를 위한 기능입니다.", timestamp: "10:01"},
    ],
    2: [{id: 4, authorId: 3, text: "6월 공지사항입니다.", timestamp: "11:30"}],
    3: [{id: 5, authorId: 4, text: "React 19 변경사항 다들 보셨나요?", timestamp: "14:00"}],
  });

  const [selectedServer, setSelectedServer] = useState<Server>(servers[0]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(servers[0].categories[0].channels[0]);
  const [openCategories, setOpenCategories] = useState<{[key: number]: boolean}>({1: true, 2: true, 3: true});
  const [unreadChannels, setUnreadChannels] = useState<{[key: number]: boolean}>({});
  const [notificationSettings, setNotificationSettings] = useState<{[channelId: number]: 'all' | 'mentions' | 'none'}>({});
  const [currentThread, setCurrentThread] = useState<Message | null>(null);

  const [currentMessage, setCurrentMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal, Dialog, and Search states
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isAddServerDialogOpen, setIsAddServerDialogOpen] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddChannelDialogOpen, setIsAddChannelDialogOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [contextMenu, setContextMenu] = useState<{ type: string; id: string | number } | null>(null);

  // Edit states
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [isEditServerDialogOpen, setIsEditServerDialogOpen] = useState(false);
  const [editedServerName, setEditedServerName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [isEditChannelDialogOpen, setIsEditChannelDialogOpen] = useState(false);
  const [editedChannelName, setEditedChannelName] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editedMessageText, setEditedMessageText] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChannel, searchResults]);

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results: Message[] = [];

    selectedServer.categories.forEach(category => {
      category.channels.forEach(channel => {
        const channelMessages = messages[channel.id] || [];
        channelMessages.forEach(msg => {
          if (msg.text?.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push({ ...msg, channelId: channel.id });
          }
        });
      });
    });
    setSearchResults(results);
  };

  const handleServerSelect = (server: Server) => {
    setSelectedServer(server);
    if (server.categories.length > 0 && server.categories[0].channels.length > 0) {
      handleChannelSelect(server.categories[0].channels[0]);
    } else {
      setSelectedChannel(null as any);
    }
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    setUnreadChannels(prev => ({ ...prev, [channel.id]: false }));
    setIsSearching(false);
    setSearchQuery("");
  };

  const toggleCategory = (categoryId: number) => {
    setOpenCategories(prev => ({...prev, [categoryId]: !prev[categoryId]}));
  }

  const addServer = () => {
    if (newServerName.trim() === "") return;
    const newServer: Server = { id: Date.now(), name: newServerName, icon: newServerName.charAt(0).toUpperCase(), categories: [] };
    setServers([...servers, newServer]);
    setNewServerName("");
    setIsAddServerDialogOpen(false);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() === "" || !selectedServer) return;
    const newCategory: Category = { id: Date.now(), name: newCategoryName, channels: [] };
    const updatedServers = servers.map(s => s.id === selectedServer.id ? { ...s, categories: [...s.categories, newCategory] } : s);
    setServers(updatedServers);
    setNewCategoryName("");
    setIsAddCategoryDialogOpen(false);
  };

  const handleAddChannel = () => {
    if (newChannelName.trim() === "" || currentCategoryId === null) return;
    const newChannel: Channel = { id: Date.now(), name: newChannelName };
    const updatedServers = servers.map(server => {
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
    });
    setServers(updatedServers);
    setMessages(prev => ({...prev, [newChannel.id]: []}));
    setNewChannelName("");
    setIsAddChannelDialogOpen(false);
    setCurrentCategoryId(null);
  };

  const handleEditServer = () => {
    if (!editingServer || editedServerName.trim() === "") return;
    const updatedServers = servers.map(s => s.id === editingServer.id ? { ...s, name: editedServerName } : s);
    setServers(updatedServers);
    if (selectedServer.id === editingServer.id) {
      setSelectedServer(prev => ({ ...prev!, name: editedServerName }));
    }
    setIsEditServerDialogOpen(false);
  };
  
  const handleEditCategory = () => {
    if (!editingCategory || editedCategoryName.trim() === "") return;
    const updatedServers = servers.map(server => ({
      ...server,
      categories: server.categories.map(c => c.id === editingCategory.id ? { ...c, name: editedCategoryName } : c),
    }));
    setServers(updatedServers);
    setIsEditCategoryDialogOpen(false);
  };
  
  const handleEditChannel = () => {
    if (!editingChannel || editedChannelName.trim() === "") return;
    const updatedServers = servers.map(server => ({
      ...server,
      categories: server.categories.map(category => ({
        ...category,
        channels: category.channels.map(c => c.id === editingChannel.id ? { ...c, name: editedChannelName } : c),
      })),
    }));
    setServers(updatedServers);
    setIsEditChannelDialogOpen(false);
  };

  const handleDeleteChannel = (channelId: number) => {
    if (!window.confirm("정말로 이 채널을 삭제하시겠습니까?")) return;
    const updatedServers = servers.map(server => ({
      ...server,
      categories: server.categories.map(category => ({
        ...category,
        channels: category.channels.filter(c => c.id !== channelId)
    }))
  }));
    setServers(updatedServers);
    // If the deleted channel was selected, select the first available channel
    if (selectedChannel?.id === channelId) {
      const firstChannel = updatedServers.find(s => s.id === selectedServer.id)?.categories[0]?.channels[0];
      setSelectedChannel(firstChannel || null as any);
    }
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (!window.confirm("정말로 이 카테고리를 삭제하시겠습니까? 카테고리 안의 모든 채널이 삭제됩니다.")) return;
    const updatedServers = servers.map(server => ({
      ...server,
      categories: server.categories.filter(c => c.id !== categoryId)
    }));
    setServers(updatedServers);
  };

  const handleSendMessage = () => {
    if (currentMessage.trim() === "" || !selectedChannel) return;
    const newMessage: Message = {
      id: Date.now(),
      authorId: currentUser.id,
      text: currentMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => ({ ...prev, [selectedChannel.id]: [...(prev[selectedChannel.id] || []), newMessage] }));
    setCurrentMessage("");
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedChannel) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result;
    
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
  };

  const handleStartEditMessage = (message: Message) => {
    if (message.authorId !== currentUser.id) return;
    setEditingMessageId(message.id);
    setEditedMessageText(message.text || '');
  };

  const handleCancelEditMessage = () => {
    setEditingMessageId(null);
    setEditedMessageText("");
  };

  const handleSaveEditMessage = () => {
    if (editingMessageId === null || !selectedChannel) return;
    setMessages(prev => ({
      ...prev,
      [selectedChannel.id]: prev[selectedChannel.id].map(msg =>
        msg.id === editingMessageId ? { ...msg, text: editedMessageText } : msg
      ),
    }));
    setEditingMessageId(null);
    setEditedMessageText("");
  };

  const handleDeleteMessage = (messageId: number) => {
    if (!selectedChannel || !window.confirm("정말로 이 메시지를 삭제하시겠습니까?")) return;
    setMessages(prev => ({
      ...prev,
      [selectedChannel.id]: prev[selectedChannel.id].filter(msg => msg.id !== messageId),
    }));
  };

  const handleReaction = (messageId: number, emoji: string) => {
    if (!selectedChannel) return;
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
  };

  const handleNotificationChange = (channelId: number, setting: 'all' | 'mentions' | 'none') => {
    setNotificationSettings(prev => ({ ...prev, [channelId]: setting }));
  };

  const handleOpenThread = (message: Message) => {
    setCurrentThread(message);
  };

  const handleCloseThread = () => {
    setCurrentThread(null);
  };

  const handleReplyInThread = (replyText: string) => {
    if (!currentThread || !selectedChannel) return;
    const newReply: Message = {
      id: Date.now(),
      authorId: currentUser.id,
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = messages[selectedChannel.id].map(msg => {
      if (msg.id === currentThread.id) {
        const updatedThread = [...(msg.thread || []), newReply];
        return { ...msg, thread: updatedThread };
      }
      return msg;
    });

    setMessages(prev => ({ ...prev, [selectedChannel.id]: updatedMessages }));
    setCurrentThread(prev => prev ? { ...prev, thread: [...(prev.thread || []), newReply] } : null);
  };

  // DIALOG OPENERS
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

  const renderMessage = (msg: Message, prevMsg: Message | null, isSearchResult: boolean = false) => {
    const author = users[msg.authorId];
    const showAuthor = !prevMsg || prevMsg.authorId !== msg.authorId || isSearchResult;
    let channelName = "";
    
    if (isSearchResult) {
      selectedServer.categories.forEach(cat => {
        const foundChannel = cat.channels.find(chan => chan.id === msg.channelId);
        if (foundChannel) channelName = foundChannel.name;
      });
    }

    const threadReplyCount = msg.thread?.length || 0;

    return (
      <DropdownMenu 
        key={msg.id}
        open={contextMenu?.type === 'message' && contextMenu.id === msg.id}
        onOpenChange={(isOpen) => !isOpen && setContextMenu(null)}
      >
        <DropdownMenuTrigger asChild>
          <div 
            onContextMenu={(e) => { e.preventDefault(); setContextMenu({ type: 'message', id: msg.id }); }}
            className={`group relative flex items-start space-x-3 hover:bg-gray-800/50 p-2 rounded-md ${showAuthor ? 'mt-2' : ''}`}>
            {showAuthor ? (
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold flex-shrink-0 cursor-pointer" onClick={(e) => {e.stopPropagation(); setViewingUser(author)}}>{author?.avatar}</div>
            ) : (
              <div className="w-10 h-10"></div>
            )}
            <div className="flex-1">
              {showAuthor && (
                <div className="flex items-baseline space-x-2">
                  <span className="font-bold text-white cursor-pointer" onClick={(e) => {e.stopPropagation(); setViewingUser(author)}}>{author?.name}</span>
                  <span className="text-xs text-gray-400">{msg.timestamp}</span>
                  {isSearchResult && channelName && <span className="text-xs text-gray-500">(in #{channelName})</span>}
                </div>
              )}
                  
              {editingMessageId === msg.id ? (
                <div>
                  <Input type="text" value={editedMessageText} onChange={(e) => setEditedMessageText(e.target.value)}
                    className="bg-gray-900 border-gray-500 text-white mt-1"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEditMessage(); if (e.key === 'Escape') handleCancelEditMessage(); }} />
                  <div className="text-xs text-gray-400 mt-1">Enter to save, Esc to cancel</div>
                </div>
              ) : (
                <>
                  {msg.text && <p className="text-gray-200">{msg.text}</p>}
                  {msg.file && (
                    <div className="mt-2">
                      {msg.file.type.startsWith('image/') ? (
                        <Image src={msg.file.url} alt={msg.file.name} width={200} height={200} className="rounded-md"/>
                      ) : (
                        <div className="flex items-center bg-gray-800 p-2 rounded-md border border-gray-600">
                          <FileIcon className="h-6 w-6 mr-2"/>
                          <span>{msg.file.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center space-x-2 mt-2">
                {msg.reactions && Object.entries(msg.reactions).map(([emoji, userIds]) => (
                  userIds.length > 0 && (
                    <div key={emoji} onClick={(e) => {e.stopPropagation(); handleReaction(msg.id, emoji)}} 
                      className={`flex items-center space-x-1 bg-gray-800/70 rounded-full px-2 py-1 cursor-pointer hover:bg-gray-600
                      ${userIds.includes(currentUser.id) ? 'border border-blue-500' : 'border border-transparent'}`}>
                      <span>{emoji}</span>
                      <span className="text-sm font-semibold">{userIds.length}</span>
                    </div>
                  )
                ))}
                {threadReplyCount > 0 && (
                  <div onClick={(e) => {e.stopPropagation(); handleOpenThread(msg)}} className="flex items-center space-x-1 text-xs text-blue-400 cursor-pointer hover:underline">
                    <MessageSquareIcon size={14}/>
                    <span>{threadReplyCount} {threadReplyCount > 1 ? 'replies' : 'reply'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className="bg-gray-800 border-gray-700 text-white">
          <DropdownMenuItem onClick={() => handleOpenThread(msg)}>Reply in Thread</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Add Reaction</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="bg-gray-800 border-gray-700 text-white">
                  <DropdownMenuItem onClick={() => handleReaction(msg.id, '👍')}>👍</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleReaction(msg.id, '❤️')}>❤️</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleReaction(msg.id, '😂')}>😂</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleReaction(msg.id, '😮')}>😮</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
          </DropdownMenuSub>
          {msg.authorId === currentUser.id && !msg.file && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStartEditMessage(msg)}>Edit Message</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteMessage(msg.id)} className="text-red-500">Delete Message</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <WindowFrame title={selectedServer ? selectedServer.name : "Slack Clone"} onClose={onLogout}>
      <UserProfileModal user={viewingUser} isOpen={!!viewingUser} onClose={() => setViewingUser(null)} />

      <div className="flex h-full bg-gray-800 text-white">
        {/* Server List */}
        <div className="w-20 bg-gray-900 p-3 flex flex-col items-center space-y-3 flex-shrink-0">
          {servers.map(server => (
            <div key={server.id} onClick={() => handleServerSelect(server)} title={server.name}
              className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer text-2xl font-bold transition-all duration-200
              ${selectedServer.id === server.id ? 'bg-blue-600 rounded-2xl' : 'bg-gray-700 hover:bg-blue-500 hover:rounded-2xl'}`}>
              {server.icon}
            </div>
          ))}
            <Dialog open={isAddServerDialogOpen} onOpenChange={setIsAddServerDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-14 h-14 rounded-full bg-gray-700 hover:bg-green-500 text-white text-2xl">+
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
                <DialogHeader><DialogTitle>서버 만들기</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="name">서버 이름</Label>
                  <Input id="name" value={newServerName} onChange={(e) => setNewServerName(e.target.value)} className="bg-gray-700 border-gray-600"/>
                </div>
                <DialogFooter><Button type="submit" onClick={addServer}>만들기</Button></DialogFooter>
              </DialogContent>
            </Dialog>
        </div>

        {/* Channel List */}
        <div className="w-72 bg-gray-800 flex flex-col flex-shrink-0">
          <DropdownMenu
            open={contextMenu?.type === 'server' && contextMenu.id === selectedServer.id}
            onOpenChange={(isOpen) => !isOpen && setContextMenu(null)}
          >
            <DropdownMenuTrigger asChild>
              <div 
                onContextMenu={(e) => { e.preventDefault(); setContextMenu({ type: 'server', id: selectedServer.id }); }}
                className="p-3 font-bold border-b border-gray-900 shadow-md flex justify-between items-center cursor-pointer hover:bg-gray-700">
                <h3>{selectedServer.name}</h3>
                <Settings className="h-5 w-5 text-gray-400"/>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className="w-56 bg-gray-800 border-gray-700 text-white">
              <DropdownMenuItem onClick={() => openEditServerDialog(selectedServer)}>서버 이름 수정</DropdownMenuItem>
              <DropdownMenuItem onClick={openAddCategoryDialog}>카테고리 만들기</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ul className="flex-1 overflow-y-auto mt-2 space-y-1 p-2">
            {selectedServer.categories.map(category => (
              <li key={category.id}>
                <DropdownMenu
                  open={contextMenu?.type === 'category' && contextMenu.id === category.id}
                  onOpenChange={(isOpen) => !isOpen && setContextMenu(null)}
                >
                  <DropdownMenuTrigger asChild>
                    <div 
                      onContextMenu={(e) => { e.preventDefault(); setContextMenu({ type: 'category', id: category.id }); }}
                      className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase px-2 py-1 cursor-pointer hover:text-gray-200">
                      <div className="flex items-center" onClick={(e) => {e.stopPropagation(); toggleCategory(category.id)}}>
                        {openCategories[category.id] ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                        <span className="ml-1">{category.name}</span>
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className="w-56 bg-gray-800 border-gray-700 text-white">
                      <DropdownMenuItem onClick={() => openAddChannelDialog(category.id)}>채널 만들기</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditCategoryDialog(category)}>카테고리 수정</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteCategory(category.id)} className="text-red-500">카테고리 삭제</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                {openCategories[category.id] && category.channels.map(channel => (
                  <DropdownMenu 
                    key={channel.id}
                    open={contextMenu?.type === 'channel' && contextMenu.id === channel.id}
                    onOpenChange={(isOpen) => !isOpen && setContextMenu(null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <div 
                        onContextMenu={(e) => { e.preventDefault(); setContextMenu({ type: 'channel', id: channel.id }); }}
                        className={`group flex items-center justify-between p-2 cursor-pointer rounded-md ${unreadChannels[channel.id] ? 'text-white font-semibold' : 'text-gray-400'} hover:bg-gray-700 hover:text-white ${selectedChannel?.id === channel.id ? 'bg-gray-700 text-white' : ''}`}>
                        <div className="flex items-center flex-1 truncate" onClick={() => handleChannelSelect(channel)}>
                          {notificationSettings[channel.id] === 'none' ? <BellOff className="h-4 w-4 mr-2 text-gray-500"/> : <Hash className="h-5 w-5 mr-2"/>}
                          <span className="truncate">{channel.name}</span>
                        </div>
                        {unreadChannels[channel.id] && <div className="w-2 h-2 bg-white rounded-full mr-2"></div>}
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className="w-56 bg-gray-800 border-gray-700 text-white">
                      <DropdownMenuItem onClick={() => openEditChannelDialog(channel)}>채널 수정</DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>알림 설정</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent className="bg-gray-800 border-gray-700 text-white">
                                <DropdownMenuItem onClick={() => handleNotificationChange(channel.id, 'all')}>All Messages</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleNotificationChange(channel.id, 'mentions')}>@mentions Only</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleNotificationChange(channel.id, 'none')}>Nothing</DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        <DropdownMenuSeparator/>
                      <DropdownMenuItem onClick={() => handleDeleteChannel(channel.id)} className="text-red-500">채널 삭제</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </li>
            ))}
          </ul>
          <DropdownMenu
            open={contextMenu?.type === 'userProfile' && contextMenu.id === 'userProfile'}
            onOpenChange={(isOpen) => !isOpen && setContextMenu(null)}
          >
            <DropdownMenuTrigger asChild>
              <div 
                onContextMenu={(e) => { e.preventDefault(); setContextMenu({ type: 'userProfile', id: 'userProfile' }); }}
                className="p-3 border-t border-gray-900 flex items-center space-x-3 bg-gray-850 cursor-pointer hover:bg-gray-800">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold">{currentUser.avatar}</div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-850"></div>
                </div>
                <span className="font-bold">{currentUser.name}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className="w-56 bg-gray-800 border-gray-700 text-white">
              <DropdownMenuItem onClick={() => alert('Set status clicked')}>Set Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewingUser(currentUser)}>Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-500">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 flex bg-gray-700 relative">
          {/* Chat Area */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${currentThread ? 'w-1/2' : 'w-full'}`}>
            <div className="p-3 border-b border-gray-900 shadow-md flex items-center justify-between">
              <div className="flex items-center">
                <Hash className="h-6 w-6 text-gray-400 mr-2"/>
                <h2 className="text-xl font-bold text-white">{selectedChannel?.name}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <Input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-gray-900 border-gray-600 text-white w-48 h-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-1">
              {isSearching ? (
                searchResults.length > 0 ? (
                  searchResults.map((msg, index, arr) => renderMessage(msg, index > 0 ? arr[index - 1] : null, true))
                ) : (
                  <div className="text-center text-gray-400">No results found for &quot;{searchQuery}&quot;</div>
                )
              ) : (
                (selectedChannel && messages[selectedChannel?.id] || []).map((msg: Message, index: number, arr: Message[]) => renderMessage(msg, index > 0 ? arr[index - 1] : null))
              )}
              <div ref={messagesEndRef} />
            </div>
              <div className="p-4">
                <div className="bg-gray-600 p-2 rounded-lg flex items-center">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <Plus className="h-6 w-6 text-gray-400 mx-2 cursor-pointer hover:text-white" onClick={() => fileInputRef.current?.click()}/>
                  <input type="text" placeholder={`Message #${selectedChannel?.name}`} className="flex-1 bg-transparent focus:outline-none text-white"
                  value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                </div>
              </div>
            </div>
            {currentThread && (
              <div className="w-1/2 border-l border-gray-600">
                <ThreadView 
                  originalMessage={currentThread}
                  users={users}
                  onClose={handleCloseThread}
                  onReply={handleReplyInThread}
                  renderMessage={renderMessage}
                />
              </div>
            )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
          <DialogHeader><DialogTitle>카테고리 만들기</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="cat-name">카테고리 이름</Label>
            <Input id="cat-name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="bg-gray-700 border-gray-600"/>
          </div>
          <DialogFooter><Button onClick={handleAddCategory}>만들기</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isAddChannelDialogOpen} onOpenChange={setIsAddChannelDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
          <DialogHeader><DialogTitle>채널 만들기</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="chan-name">채널 이름</Label>
            <Input id="chan-name" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} className="bg-gray-700 border-gray-600"/>
          </div>
          <DialogFooter><Button onClick={handleAddChannel}>만들기</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditServerDialogOpen} onOpenChange={setIsEditServerDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
          <DialogHeader><DialogTitle>서버 이름 수정</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="server-name">서버 이름</Label>
            <Input id="server-name" value={editedServerName} onChange={e => setEditedServerName(e.target.value)} className="bg-gray-700 border-gray-600"/>
          </div>
          <DialogFooter><Button onClick={handleEditServer}>저장</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
          <DialogHeader><DialogTitle>카테고리 이름 수정</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="cat-edit-name">카테고리 이름</Label>
            <Input id="cat-edit-name" value={editedCategoryName} onChange={e => setEditedCategoryName(e.target.value)} className="bg-gray-700 border-gray-600"/>
          </div>
          <DialogFooter><Button onClick={handleEditCategory}>저장</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditChannelDialogOpen} onOpenChange={setIsEditChannelDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
          <DialogHeader><DialogTitle>채널 이름 수정</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="chan-edit-name">채널 이름</Label>
            <Input id="chan-edit-name" value={editedChannelName} onChange={e => setEditedChannelName(e.target.value)} className="bg-gray-700 border-gray-600"/>
          </div>
          <DialogFooter><Button onClick={handleEditChannel}>저장</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </WindowFrame>
  );
}