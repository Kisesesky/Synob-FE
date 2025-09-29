import React, { useState } from 'react';
import { Hash, Plus, X, Search } from 'lucide-react'; // Import X and Search for cancel and search button
import { useAppContext } from '@/contexts/AppContext';
import { MessageItem } from './MessageItem';
import { Message } from '@/lib/types';
import { groupMessagesByDate } from '../../lib/utils';
import { EmojiPicker } from '@/components/EmojiPicker';

interface DateHeader {
  type: 'dateHeader';
  date: string;
  id: string;
}

type GroupedMessageItem = Message | DateHeader;

export const ChatArea = () => {
  const { 
    selectedChannel, 
    messages, // messages for all channels
    isSearching, 
    searchResults, 
    searchQuery, 
    setSearchQuery, 
    handleSearch, 
    currentMessage, 
    setCurrentMessage, 
    handleSendMessage, 
    fileInputRef, 
    handleFileUpload, 
    messagesEndRef, 
    replyingToMessage, // Import replyingToMessage
    handleCancelReply, // Import handleCancelReply
    users, // Import users to get author info
    viewMode,
    selectedDmChannel,
    setIsSearching, // Import setIsSearching
    ...messageItemProps
  } = useAppContext();

  const handleEmojiSelect = (emoji: string) => {
    setCurrentMessage(currentMessage + emoji);
  };

  console.log('ChatArea - currentMessage:', currentMessage); // Debug log

  const repliedToAuthor = replyingToMessage ? users[replyingToMessage.authorId] : null;

  const activeChannel = viewMode === 'friends' ? selectedDmChannel : selectedChannel;
  console.log('ChatArea - activeChannel:', activeChannel); // Debug log

  // Define currentChannelMessages here
  const currentChannelMessages: Message[] = activeChannel ? messages[activeChannel.id] || [] : [];
  console.log('ChatArea - currentChannelMessages:', currentChannelMessages); // Debug log

  const groupedMessages = groupMessagesByDate(currentChannelMessages);
  console.log('ChatArea - groupedMessages:', groupedMessages); // Debug log

  if (viewMode === 'friends' && !selectedDmChannel) {
    return (
      <div className='flex-1 flex flex-col h-full items-center justify-center text-gray-400'>
        <p>Select a friend to start a conversation.</p>
      </div>
    );
  }

  if (!activeChannel) {
    return (
      <div className='flex-1 flex flex-col h-full items-center justify-center text-gray-400'>
        <p>Select a channel to start chatting.</p>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full transition-all duration-300 ease-in-out w-full bg-gray-700 border-l border-gray-800`}>
      <div className='p-2 border-b border-gray-900 shadow-md flex items-center justify-between'>
        <div className='flex items-center'>
          {viewMode === 'server' && <Hash className='h-6 w-6 text-gray-400 mr-2'/>}
          <h2 className='text-xl font-bold text-white'>{activeChannel?.name}</h2>
        </div>
        <div className='flex items-center space-x-2'>
          <Search className='h-6 w-6 text-gray-400 cursor-pointer hover:text-white' onClick={() => setIsSearching(true)}/>
        </div>
      </div>
      <div className='flex-1 p-4 overflow-y-auto space-y-0'>
        {groupedMessages.map((item, index) => {
          if ('type' in item && item.type === 'dateHeader') {
            return (
              <div key={item.id} className='relative flex justify-center items-center my-4'>
                <div className='flex-grow border-t border-gray-700'></div>
                <span className='flex-shrink mx-4 text-sm text-gray-400'>{item.date}</span>
                <div className='flex-grow border-t border-gray-700'></div>
              </div>
            );
          } else {
            const msg = item as Message;
            // Find the previous actual message, skipping date headers
            let prevMsg: Message | null = null;
            for (let i = index - 1; i >= 0; i--) {
              const prevItem = groupedMessages[i];
              if (!('type' in prevItem && prevItem.type === 'dateHeader')) {
                prevMsg = prevItem as Message;
                break;
              }
            }
            return (
              <MessageItem
                key={msg.id}
                msg={msg}
                prevMsg={prevMsg}
                allChannelMessages={currentChannelMessages}
                {...messageItemProps}
              />
            );
          }
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className='p-4'>
        {replyingToMessage && ( // Display reply context
          <div className='flex items-center justify-between bg-gray-700 p-2 rounded-t-lg border-b border-gray-600'>
            <div className='flex items-center'>
              <span className='text-xs text-gray-400 mr-2'>Replying to</span>
              <div className='w-5 h-5 mr-2 rounded-full bg-gray-600 flex items-center justify-center font-bold flex-shrink-0 text-xs'>{repliedToAuthor?.avatar}</div>
              <span className='font-bold text-white mr-2'>{repliedToAuthor?.name}</span>
              <span className='text-sm text-gray-300 truncate'>{replyingToMessage.text?.substring(0, 50)}...</span>
            </div>
            <X className='h-4 w-4 text-gray-400 cursor-pointer hover:text-white' onClick={handleCancelReply} />
          </div>
        )}
        <div className={`bg-gray-600 p-2 rounded-lg flex items-center ${replyingToMessage ? 'rounded-t-none' : ''}`}>
          <input type='file' ref={fileInputRef} onChange={handleFileUpload} className='hidden' />
          <Plus className='h-6 w-6 text-gray-400 mx-2 cursor-pointer hover:text-white' onClick={() => fileInputRef.current?.click()}/>
          <input type='text'
            placeholder={replyingToMessage ? `Replying to ${repliedToAuthor?.name}...` : `Message #${activeChannel?.name}`}
            className='flex-1 bg-transparent focus:outline-none text-white'
            value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} onKeyDown={(e) => {
              console.log('ChatArea - KeyDown event, key:', e.key); // Debug log
              if (e.key === 'Enter') {
                console.log('ChatArea - Enter pressed, calling handleSendMessage'); // Debug log
                handleSendMessage();
              }
            }} />
          <EmojiPicker onSelect={handleEmojiSelect} />
        </div>
      </div>
    </div>
  )
}
