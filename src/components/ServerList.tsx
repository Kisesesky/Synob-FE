'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

export const ServerList = () => {
  const { 
    servers, 
    selectedServer, 
    handleServerSelect, 
    isAddServerDialogOpen, 
    setIsAddServerDialogOpen, 
    newServerName, 
    setNewServerName, 
    addServer,
    viewMode,
    setViewMode,
  } = useAppContext();

  return (
    <div className='w-20 bg-gray-900 p-3 flex flex-col items-center space-y-3 flex-shrink-0'>
      <div onClick={() => setViewMode('friends')} title="Friends"
        className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer text-2xl font-bold transition-all duration-200
        ${viewMode === 'friends' ? 'bg-blue-600 rounded-2xl' : 'bg-gray-700 hover:bg-blue-500 hover:rounded-2xl'}`}>
        <Home />
      </div>
      <hr className='w-10 border-gray-700' />
      {servers.map(server => (
        <div key={server.id} onClick={() => { handleServerSelect(server); setViewMode('server'); }} title={server.name}
          className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer text-2xl font-bold transition-all duration-200
          ${viewMode === 'server' && selectedServer.id === server.id ? 'bg-blue-600 rounded-2xl' : 'bg-gray-700 hover:bg-blue-500 hover:rounded-2xl'}`}>
          {server.icon}
        </div>
      ))}
      <Dialog open={isAddServerDialogOpen} onOpenChange={setIsAddServerDialogOpen}>
        <DialogTrigger asChild>
          <Button variant='outline' className='w-14 h-14 rounded-full bg-gray-700 hover:bg-green-500 text-white text-2xl'>+
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[425px] bg-gray-800 text-white border-gray-700'>
          <DialogHeader><DialogTitle>서버 만들기</DialogTitle></DialogHeader>
          <div className='grid gap-4 py-4'>
            <Label htmlFor='name'>서버 이름</Label>
            <Input id='name' value={newServerName} onChange={(e) => setNewServerName(e.target.value)} className='bg-gray-700 border-gray-600'/>
          </div>
          <DialogFooter><Button type='submit' onClick={addServer}>만들기</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};