'use client';

import React, { useMemo } from 'react';
import { X, Pin } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { MessageItem } from '@/features/chat/MessageItem';
import { ScrollArea } from '@/components/ui/scroll-area';

export const PinnedMessagesPanel = () => {
  const { isPinnedMessagesOpen, setIsPinnedMessagesOpen, messages, selectedChannel, users } = useAppContext();

  const pinnedMessages = useMemo(() => {
    if (!selectedChannel) return [];
    return (messages[selectedChannel.id] || []).filter(msg => msg.isPinned);
  }, [messages, selectedChannel]);

  console.log(`PinnedMessagesPanel: Rendering for channel ${selectedChannel?.id}, open: ${isPinnedMessagesOpen}`);

  if (!isPinnedMessagesOpen || !selectedChannel) {
    return null;
  }
  console.log(`PinnedMessagesPanel: Found ${pinnedMessages.length} pinned messages.`);

  return (
    <div className="w-[40%] bg-gray-900 border-l border-gray-700 flex flex-col z-10">
      <div className="p-3 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center"><Pin className="h-5 w-5 mr-2"/> Pinned Messages</h3>
        <button onClick={() => setIsPinnedMessagesOpen(false)}>
          <X size={20} className="text-white"/>
        </button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {pinnedMessages.length > 0 ? (
          <div className="space-y-4">
            {pinnedMessages.map(msg => (
              <MessageItem 
                key={msg.id} 
                msg={msg} 
                prevMsg={null} // For simplicity, treat pinned messages as always showing author
                repliedToMessage={msg.repliedToMessageId ? messages[selectedChannel.id].find(m => m.id === msg.repliedToMessageId) || null : null}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center">No pinned messages in this channel.</p>
        )}
      </ScrollArea>
    </div>
  );
};
