'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent,
  DropdownMenuSubTrigger, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BellOff, ChevronDown, ChevronRight, Hash, Settings
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
export const ChannelList = ({ onLogout }: { onLogout: () => void }) => {
  const { 
    selectedServer, 
    selectedChannel, 
    currentUser, 
    openCategories, 
    unreadChannels, 
    notificationSettings, 
    contextMenu, 
    setContextMenu, 
    handleChannelSelect, 
    toggleCategory, 
    openEditServerDialog, 
    openAddCategoryDialog, 
    openAddChannelDialog, 
    openEditCategoryDialog, 
    handleDeleteCategory, 
    openEditChannelDialog, 
    handleNotificationChange, 
    handleDeleteChannel, 
    setViewingUser,
    // Dialogs
    isAddCategoryDialogOpen,
    setIsAddCategoryDialogOpen,
    newCategoryName,
    setNewCategoryName,
    handleAddCategory,
    isAddChannelDialogOpen,
    setIsAddChannelDialogOpen,
    newChannelName,
    setNewChannelName,
    handleAddChannel,
    isEditServerDialogOpen,
    setIsEditServerDialogOpen,
    editedServerName,
    setEditedServerName,
    handleEditServer,
    isEditCategoryDialogOpen,
    setIsEditCategoryDialogOpen,
    editedCategoryName,
    setEditedCategoryName,
    handleEditCategory,
    isEditChannelDialogOpen,
    setIsEditChannelDialogOpen,
    editedChannelName,
    setEditedChannelName,
    handleEditChannel
  } = useAppContext();

  return (
    <>
      <div className='w-72 bg-gray-100 dark:bg-gray-800 flex flex-col flex-shrink-0'>
        <div 
          onContextMenu={(e) => { e.preventDefault(); setContextMenu({ type: 'server', id: selectedServer.id, x: e.clientX, y: e.clientY }); }}
          className='p-3 font-bold border-b border-gray-200 dark:border-gray-900 shadow-md flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white'>
          <h3>{selectedServer.name}</h3>
          <Settings className='h-5 w-5 text-gray-500 dark:text-gray-400'/>
        </div>
        <DropdownMenu
          open={contextMenu?.type === 'server' && contextMenu.id === selectedServer.id}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setContextMenu(null);
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <div style={{ position: 'fixed', top: contextMenu?.y ?? 0, left: contextMenu?.x ?? 0 }} />
          </DropdownMenuTrigger>
          <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className='w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-black dark:text-white'>
            <DropdownMenuItem onClick={() => openEditServerDialog(selectedServer)}>서버 이름 수정</DropdownMenuItem>
            <DropdownMenuItem onClick={openAddCategoryDialog}>카테고리 만들기</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <ul className='flex-1 overflow-y-auto mt-2 space-y-1 p-2'>
          {selectedServer.categories.map(category => (
            <li key={category.id}>
              <div 
                onContextMenu={(e) => { 
                  e.preventDefault(); 
                  setContextMenu({ type: 'category', id: category.id, x: e.clientX, y: e.clientY }); 
                }}
                onClick={() => toggleCategory(category.id)}
                className='flex justify-between items-center text-sm font-bold text-gray-500 dark:text-gray-400 uppercase px-2 py-1 cursor-pointer hover:text-black dark:hover:text-gray-200'
              >
                <div className='flex items-center'>
                  {openCategories[category.id] ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                  <span className='ml-1'>{category.name}</span>
                </div>
              </div>
              <DropdownMenu
                open={contextMenu?.type === 'category' && contextMenu.id === category.id}
                onOpenChange={(isOpen) => {
                  if (!isOpen) {
                    setContextMenu(null);
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <div style={{ position: 'fixed', top: contextMenu?.y ?? 0, left: contextMenu?.x ?? 0 }} />
                </DropdownMenuTrigger>
                <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className='w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-black dark:text-white'>
                  <DropdownMenuItem onClick={() => openEditCategoryDialog(category)}>카테고리 수정</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteCategory(category.id)} className='text-red-500'>카테고리 삭제</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {openCategories[category.id] && category.channels.map(channel => {
                return (
                <React.Fragment key={channel.id}>
                  <div 
                    onContextMenu={(e) => { e.preventDefault(); setContextMenu({ type: 'channel', id: channel.id, x: e.clientX, y: e.clientY }); }}
                    onClick={() => handleChannelSelect(channel)}
                    className={`group flex items-center justify-between p-2 cursor-pointer rounded-md ${(unreadChannels[channel.id] || false) ? 'text-black dark:text-white font-semibold' : 'text-gray-500 dark:text-gray-400'} hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white ${selectedChannel?.id === channel.id ? 'bg-gray-300 dark:bg-gray-700 text-black dark:text-white' : ''}`}>
                    <div className='flex items-center flex-1 truncate'>
                      {(notificationSettings[channel.id] || 'all') === 'none' ? <BellOff className='h-4 w-4 mr-2 text-gray-600 dark:text-gray-500'/> : <Hash className='h-5 w-5 mr-2'/>}
                      <span className='truncate'>{channel.name}</span>
                    </div>
                    {(unreadChannels[channel.id] || false) && <div className='w-2 h-2 bg-black dark:bg-white rounded-full mr-2'></div>}
                  </div>
                  <DropdownMenu 
                    open={contextMenu?.type === 'channel' && contextMenu.id === channel.id}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setContextMenu(null);
                      }
                    }}
                  >
                    <DropdownMenuTrigger asChild>
                      <div style={{ position: 'fixed', top: contextMenu?.y ?? 0, left: contextMenu?.x ?? 0 }} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className='w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-black dark:text-white'>
                      <DropdownMenuItem onClick={() => openEditChannelDialog(channel)}>채널 수정</DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger><span>알림 설정</span></DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-black dark:text-white'>
                                <DropdownMenuItem onClick={() => handleNotificationChange(channel.id, 'all')}>All Messages</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleNotificationChange(channel.id, 'mentions')}>@mentions Only</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleNotificationChange(channel.id, 'none')}>Nothing</DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        <DropdownMenuSeparator/>
                      <DropdownMenuItem onClick={() => handleDeleteChannel(channel.id)} className='text-red-500'>채널 삭제</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </React.Fragment>
              )})}
            </li>
          ))}
        </ul>
        <div 
          onContextMenu={(e) => { e.preventDefault(); setContextMenu({ type: 'userProfile', id: 'userProfile', x: e.clientX, y: e.clientY }); }}
          className='p-3 border-t border-gray-200 dark:border-gray-900 flex items-center space-x-3 bg-gray-200 dark:bg-gray-900 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-800'>
          <div className='relative'>
            <div className='w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center font-bold'>{currentUser.avatar}</div>
            <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-200 dark:border-gray-850'></div>
          </div>
          <span className='font-bold'>{currentUser.name}</span>
        </div>
        <DropdownMenu
          open={contextMenu?.type === 'userProfile' && contextMenu.id === 'userProfile'}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setContextMenu(null);
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <div style={{ position: 'fixed', top: contextMenu?.y ?? 0, left: contextMenu?.x ?? 0 }} />
          </DropdownMenuTrigger>
          <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className='w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-black dark:text-white'>
            <DropdownMenuItem onClick={() => alert('Set status clicked')}>Set Status</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewingUser(currentUser)}>Profile</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className='text-red-500'>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Dialogs */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent className='sm:max-w-[425px] bg-white dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700'>
          <DialogHeader><DialogTitle>카테고리 만들기</DialogTitle></DialogHeader>
          <div className='grid gap-4 py-4'>
            <Label htmlFor='cat-name'>카테고리 이름</Label>
            <Input id='cat-name' value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className='bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'/>
          </div>
          <DialogFooter><Button onClick={handleAddCategory}>만들기</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isAddChannelDialogOpen} onOpenChange={setIsAddChannelDialogOpen}>
        <DialogContent className='sm:max-w-[425px] bg-white dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700'>
          <DialogHeader><DialogTitle>채널 만들기</DialogTitle></DialogHeader>
          <div className='grid gap-4 py-4'>
            <Label htmlFor='chan-name'>채널 이름</Label>
            <Input id='chan-name' value={newChannelName} onChange={e => setNewChannelName(e.target.value)} className='bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'/>
          </div>
          <DialogFooter><Button onClick={handleAddChannel}>만들기</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditServerDialogOpen} onOpenChange={setIsEditServerDialogOpen}>
        <DialogContent className='sm:max-w-[425px] bg-white dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700'>
          <DialogHeader><DialogTitle>서버 이름 수정</DialogTitle></DialogHeader>
          <div className='grid gap-4 py-4'>
            <Label htmlFor='server-name'>서버 이름</Label>
            <Input id='server-name' value={editedServerName} onChange={e => setEditedServerName(e.target.value)} className='bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'/>
          </div>
          <DialogFooter><Button onClick={handleEditServer}>저장</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
        <DialogContent className='sm:max-w-[425px] bg-white dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700'>
          <DialogHeader><DialogTitle>카테고리 이름 수정</DialogTitle></DialogHeader>
          <div className='grid gap-4 py-4'>
            <Label htmlFor='cat-edit-name'>카테고리 이름</Label>
            <Input id='cat-edit-name' value={editedCategoryName} onChange={e => setEditedCategoryName(e.target.value)} className='bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'/>
          </div>
          <DialogFooter><Button onClick={handleEditCategory}>저장</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditChannelDialogOpen} onOpenChange={setIsEditChannelDialogOpen}>
        <DialogContent className='sm:max-w-[425px] bg-white dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700'>
          <DialogHeader><DialogTitle>채널 이름 수정</DialogTitle></DialogHeader>
          <div className='grid gap-4 py-4'>
            <Label htmlFor='chan-edit-name'>채널 이름</Label>
            <Input id='chan-edit-name' value={editedChannelName} onChange={e => setEditedChannelName(e.target.value)} className='bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'/>
          </div>
          <DialogFooter><Button onClick={handleEditChannel}>저장</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};