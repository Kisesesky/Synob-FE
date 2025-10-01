import { useState, useMemo } from 'react';
import { Hash, Plus, X, Search, File as FileIcon, Bell, Pin, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  const [isDragging, setIsDragging] = useState(false);
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
    pendingFile,
    handleRemovePendingFile,
    isPinnedMessagesOpen, setIsPinnedMessagesOpen,
    isAnnouncementsOpen, setIsAnnouncementsOpen,
    isNotificationsOpen, setIsNotificationsOpen,
    ...messageItemProps
  } = useAppContext();

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Create a synthetic event object to pass to handleFileUpload
      const syntheticEvent = {
        target: { files: e.dataTransfer.files },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(syntheticEvent);
      e.dataTransfer.clearData();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setCurrentMessage(currentMessage + emoji);
  };

  const repliedToAuthor = replyingToMessage ? users[replyingToMessage.authorId] : null;

  const activeChannel = viewMode === 'friends' ? selectedDmChannel : selectedChannel;

  const channelMembers = activeChannel?.memberIds?.map(id => users[id]).filter(Boolean) || [];
  const displayedMembers = channelMembers.slice(0, 5); // Show first 3 members
  const remainingMembersCount = channelMembers.length - displayedMembers.length;

  const currentChannelMessages: Message[] = useMemo(() => activeChannel ? messages[activeChannel.id] || [] : [], [activeChannel, messages]);

  const groupedMessages = useMemo(() => groupMessagesByDate(currentChannelMessages), [currentChannelMessages]);

  if (viewMode === 'friends' && !selectedDmChannel) {
    return (
      <div className='flex-1 flex flex-col h-full items-center justify-center text-gray-700 dark:text-gray-400'>
        <p>Select a friend to start a conversation.</p>
      </div>
    );
  }

  if (!activeChannel) {
    return (
      <div className='flex-1 flex flex-col h-full items-center justify-center text-gray-700 dark:text-gray-400'>
        <p>Select a channel to start chatting.</p>
      </div>
    );
  }

  return (
    <div 
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()} // Necessary to allow drop
      className={`flex-1 flex flex-col h-full transition-all duration-300 ease-in-out w-full bg-white dark:bg-gray-700 border-l border-gray-200 dark:border-gray-800 relative ${isDragging ? 'border-dashed border-4 border-blue-500' : ''}`}>
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center pointer-events-none z-10">
          <p className="text-white text-2xl font-bold">Drop file to upload</p>
        </div>
      )}
      <div className='p-2 border-b border-gray-200 dark:border-gray-900 shadow-md flex items-center justify-between'>
        <div className='flex items-center'>
          {viewMode === 'server' && <Hash className='h-6 w-6 text-gray-500 dark:text-gray-400 mr-2'/>}          <h2 className='text-xl font-bold text-black dark:text-white'>{activeChannel?.name}</h2>
          <div className="flex items-center ml-4 -space-x-2">
            {displayedMembers.map(member => (
              <div key={member.id} className="w-7 h-7 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center font-bold text-xs border-2 border-white dark:border-gray-700 z-10" title="member.name">
                {member.avatar}
              </div>
            ))}
            {remainingMembersCount > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-500 flex items-center justify-center font-bold text-xs border-2 border-white dark:border-gray-700 cursor-pointer z-20" title="View more members">
                    +{remainingMembersCount}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-black dark:text-white p-2">
                  <h4 className="font-bold mb-2">Channel Members</h4>
                  <div className="space-y-1">
                    {channelMembers.slice(3).map(member => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <div className='w-6 h-6 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center font-bold text-xs'>{member.avatar}</div>
                        <span>{member.name}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <Megaphone className='h-6 w-6 text-gray-700 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white' onClick={() => setIsAnnouncementsOpen(!isAnnouncementsOpen)}/>
          <Pin className='h-6 w-6 text-gray-700 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white' onClick={() => setIsPinnedMessagesOpen(!isPinnedMessagesOpen)}/>
          <Bell className='h-6 w-6 text-gray-700 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white' onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}/>
          <Search className='h-6 w-6 text-gray-700 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white' onClick={() => setIsSearching(true)}/>
        </div>
      </div>
      <div className='flex-1 p-4 overflow-y-auto space-y-0'>
        {groupedMessages.map((item, index) => {
          if ('type' in item && item.type === 'dateHeader') {
            return (
              <div key={item.id} className='relative flex justify-center items-center my-4'>
                <div className='flex-grow border-t border-gray-200 dark:border-gray-600'></div>
                <span className='flex-shrink mx-4 text-sm text-gray-700 dark:text-gray-400'>{item.date}</span>
                <div className='flex-grow border-t border-gray-200 dark:border-gray-600'></div>
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
                repliedToMessage={msg.repliedToMessageId ? currentChannelMessages.find(m => m.id === msg.repliedToMessageId) || null : null}
                {...messageItemProps}
              />
            );
          }
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className='p-4'>
        {replyingToMessage && ( // Display reply context
          <div className='flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-t-lg border-b border-gray-200 dark:border-gray-600'>
            <div className='flex items-center'>
              <span className='text-xs text-gray-700 dark:text-gray-400 mr-2'>Replying to</span>
              <div className='w-5 h-5 mr-2 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center font-bold flex-shrink-0 text-xs'>{repliedToAuthor?.avatar}</div>
              <span className='font-bold text-black dark:text-white mr-2'>{repliedToAuthor?.name}</span>
              <span className='text-sm text-gray-700 dark:text-gray-300 truncate'>{replyingToMessage.text?.substring(0, 50)}...</span>
            </div>
            <X className='h-4 w-4 text-gray-700 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white' onClick={handleCancelReply} />
          </div>
        )}
        {pendingFile && ( // Display pending file preview
          <div className={`relative flex items-center bg-gray-200 dark:bg-gray-800 p-2 pr-8 ${replyingToMessage ? 'rounded-t-none' : 'rounded-t-lg'} border-b border-gray-300 dark:border-gray-600 shadow-md`}>
            <div className='flex items-center flex-grow'>
              {pendingFile.type.startsWith('image/') ? (
                <img src={pendingFile.url} alt="Preview" className='h-16 w-16 object-cover rounded-md mr-2' />
              ) : (
                <FileIcon className='h-7 w-7 text-gray-700 dark:text-gray-400 mr-2 p-1 bg-gray-300 dark:bg-gray-600 rounded-md' /> // Use FileIcon, add padding/bg
              )}
              <span className='text-sm text-black dark:text-white truncate'>{pendingFile.name}</span>
            </div>
            <button
              onClick={handleRemovePendingFile}
              className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
              title='Remove file'
            >
              <X className='h-4 w-4' />
            </button>
          </div>
        )}
        <div className={`bg-gray-100 dark:bg-gray-600 p-2 rounded-lg flex items-center ${replyingToMessage || pendingFile ? 'rounded-t-none' : ''}`}>
          <input type='file' ref={fileInputRef} onChange={handleFileUpload} className='hidden' />
          <Plus className='h-6 w-6 text-gray-700 dark:text-gray-400 mx-2 cursor-pointer hover:text-gray-900 dark:hover:text-white' onClick={() => fileInputRef.current?.click()}/>
          <input type='text'
            placeholder={replyingToMessage ? `Replying to ${repliedToAuthor?.name}...` : `Message #${activeChannel?.name}`}
            className='flex-1 bg-transparent focus:outline-none text-black dark:text-white'
            value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} onKeyDown={(e) => {
              console.log('ChatArea - KeyDown event, key:', e.key); // Debug log
              if (e.key === 'Enter') {
                console.log('ChatArea - Enter pressed, calling handleSendMessage'); // Debug log
                handleSendMessage();
              }
            }} 
          />
          <EmojiPicker onSelect={handleEmojiSelect} />
        </div>
      </div>
    </div>
  )
}
