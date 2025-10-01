'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';
import type { ServerId } from '@/lib/brandedTypes';
import type { Server } from '@/lib/types';
import useEmblaCarousel from 'embla-carousel-react';
import { Home } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';

export const ServerList = () => {
  const {
    servers,
    setServers,
    selectedServer,
    handleServerSelect,
    isAddServerDialogOpen,
    setIsAddServerDialogOpen,
    viewMode,
    setViewMode,
  } = useAppContext();

  const [emblaRef] = useEmblaCarousel({ loop: false, align: 'start' });

  // Local state for new server dialog
  const [newServerName, setNewServerName] = useState('');
  const [newServerImageUrl, setNewServerImageUrl] = useState('');

  const addServer = useCallback(() => {
    if (newServerName.trim() === '') {
      return;
    }
    const newServer: Server = {
      id: Date.now() as ServerId,
      name: newServerName,
      icon: newServerName.charAt(0).toUpperCase(),
      ...(newServerImageUrl && { imageUrl: newServerImageUrl }),
      categories: []
    };
    setServers(prev => [...prev, newServer]);
    setNewServerName('');
    setNewServerImageUrl('');
    setIsAddServerDialogOpen(false);
  }, [newServerName, newServerImageUrl, setServers, setIsAddServerDialogOpen]);

  return (
    <div className='fixed bottom-3 left-1/2 -translate-x-1/2 w-auto max-w-xl h-16 bg-nature-600 backdrop-blur-lg p-1 flex items-center rounded-2xl shadow-lg border border-white/10 pr-16 z-50'>
      {/* Home Icon */}
      <div className="flex-shrink-0">
        <div onClick={() => setViewMode('friends')} title="Friends"
          className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer text-xl font-bold transition-all duration-200
          ${viewMode === 'friends' 
            ? 'bg-blue-600' 
            : 'bg-gray-700 hover:bg-blue-500 hover:-translate-y-2'}`}>
          <Home />
        </div>
      </div>
      {/* Separator */}
      <div className="flex-shrink-0">
        <hr className='w-px h-12 border-l border-gray-700 mx-1' />
      </div>

      {/* Embla Carousel for Servers */}
      <div ref={emblaRef} className="overflow-hidden flex-1"> 
        <div className="flex space-x-1">
          {servers.map(server => (
            <div className="flex-shrink-0" key={server.id}>
              <div onClick={() => { handleServerSelect(server); setViewMode('server'); }} title={server.name}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer text-xl font-bold transition-all duration-200
                ${viewMode === 'server' && selectedServer.id === server.id
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-blue-500 hover:-translate-y-1'}`}
              >
                {server.imageUrl ? (
                  <Image src={server.imageUrl} alt={server.name} width={48} height={48} className="object-cover w-full h-full rounded-2xl" />
                ) : (
                  server.icon
                )}
                
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="flex-shrink-0">
        <hr className='w-px h-12 border-l border-gray-700 mx-1' />
      </div>
      {/* Add Server Button */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 z-50">
        <Dialog open={isAddServerDialogOpen} onOpenChange={setIsAddServerDialogOpen}>
          <DialogTrigger asChild>
            <Button className='w-12 h-12 rounded-full bg-gray-700 hover:bg-green-500 text-white text-xl'>+
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px] bg-gray-800 text-white'>
            <DialogHeader><DialogTitle>서버 만들기</DialogTitle></DialogHeader>
            <div className='grid gap-4 py-4'>
              <Label htmlFor='name'>서버 이름</Label>
              <Input id='name' value={newServerName} onChange={(e) => setNewServerName(e.target.value)} className='bg-gray-700 border-gray-600'/>
              <Label htmlFor='imageUrl'>이미지 URL (선택 사항)</Label>
              <Input id='imageUrl' value={newServerImageUrl} onChange={(e) => setNewServerImageUrl(e.target.value)} className='bg-gray-700 border-gray-600' placeholder='https://example.com/image.png'/>
            </div>
            <DialogFooter><Button type='submit' onClick={addServer}>만들기</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};