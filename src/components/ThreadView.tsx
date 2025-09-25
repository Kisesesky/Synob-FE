'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Message, User } from './MainPage';

interface ThreadViewProps {
  originalMessage: Message | null;
  users: { [id: number]: User };
  onClose: () => void;
  onReply: (replyText: string) => void;
  renderMessage: (msg: Message, prevMsg: Message | null) => React.ReactNode;
}

export function ThreadView({ originalMessage, users, onClose, onReply, renderMessage }: ThreadViewProps) {
  const [reply, setReply] = useState("");

  if (!originalMessage) return null;

  const handleSendReply = () => {
    if (reply.trim() === "") return;
    onReply(reply);
    setReply("");
  };

  return (
    <div className="w-full h-full bg-gray-900 border-l border-gray-700 flex flex-col z-10">
      <div className="p-3 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-bold">Thread</h3>
        <button onClick={onClose}>
          <X size={20}/>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {renderMessage(originalMessage, null)}

        <hr className="border-gray-700"/>

        <div className="text-center text-sm text-gray-400">
          {(originalMessage.thread || []).length} replies
        </div>

        {(originalMessage.thread || []).map((replyMsg, index, arr) => (
          renderMessage(replyMsg, index > 0 ? arr[index - 1] : null)
        ))}
      </div>

      <div className="p-4">
        <div className="bg-gray-600 p-2 rounded-lg flex items-center">
            <input 
              type="text" 
              placeholder="Reply..." 
              className="flex-1 bg-transparent focus:outline-none text-white"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
            />
        </div>
      </div>
    </div>
  );
}
