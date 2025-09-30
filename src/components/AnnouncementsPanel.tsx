'use client';

import React from 'react';
import { X, Megaphone } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { ScrollArea } from '@/components/ui/scroll-area';

export const AnnouncementsPanel = () => {
  const { isAnnouncementsOpen, setIsAnnouncementsOpen } = useAppContext();

  if (!isAnnouncementsOpen) {
    return null;
  }

  return (
    <div className="w-[40%] bg-gray-900 border-l border-gray-700 flex flex-col z-10">
      <div className="p-3 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center"><Megaphone className="h-5 w-5 mr-2"/> Announcements</h3>
        <button onClick={() => setIsAnnouncementsOpen(false)}>
          <X size={20} className="text-white"/>
        </button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <p className="text-gray-400 text-center">No announcements yet.</p>
      </ScrollArea>
    </div>
  );
};
