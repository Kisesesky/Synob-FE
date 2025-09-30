'use client';

import React from 'react';
import { X, Bell } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { ScrollArea } from '@/components/ui/scroll-area';

export const NotificationsPanel = () => {
  const { isNotificationsOpen, setIsNotificationsOpen } = useAppContext();

  if (!isNotificationsOpen) {
    return null;
  }

  return (
    <div className="w-[40%] bg-gray-900 border-l border-gray-700 flex flex-col z-10">
      <div className="p-3 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center"><Bell className="h-5 w-5 mr-2"/> Notifications</h3>
        <button onClick={() => setIsNotificationsOpen(false)}>
          <X size={20} className="text-white"/>
        </button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <p className="text-gray-400 text-center">No new notifications.</p>
      </ScrollArea>
    </div>
  );
};
