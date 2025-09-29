import * as React from 'react';
import Image from 'next/image';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { File as FileIcon, Reply as ReplyIcon, MessageSquare as MessageSquareIcon } from 'lucide-react';
import type { Message, User } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';
import { formatTimestamp } from '../../lib/utils'; // Import formatTimestamp

export const ThreadMessageItem = React.memo(({
  msg,
  author,
  showAuthor,
}: { msg: Message; author: User; showAuthor: boolean; }) => {
  const { 
    currentUser,
    contextMenu,
    setContextMenu,
    setViewingUser,
    handleReactionInThread,
    setReplyingToMessage,
    threadStack,
    users,
    handleOpenNestedThread,
  } = useAppContext();

  const currentThread = threadStack[threadStack.length - 1];

  const repliedToMessage = msg.repliedToMessageId
    ? currentThread?.thread?.find(m => m.id === msg.repliedToMessageId)
    : null;
  const repliedToAuthor = repliedToMessage ? users[repliedToMessage.authorId] : null;

  const handleScrollToMessage = (messageId: import('@/lib/brandedTypes').MessageId) => {
    const element = document.getElementById(`thread-message-${messageId}`);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const threadReplyCount = msg.thread?.length || 0;

  return (
    <DropdownMenu 
      key={msg.id}
      open={contextMenu?.type === 'thread_message' && contextMenu.id === msg.id}
      onOpenChange={(isOpen: boolean) => !isOpen && setContextMenu(null)}
    >
      <DropdownMenuTrigger asChild>
        <div 
          id={`thread-message-${msg.id}`}
          onContextMenu={(e) => { e.preventDefault(); setContextMenu({ type: 'thread_message', id: msg.id }); }}
          className={`group relative flex items-start space-x-3 hover:bg-gray-800/50 rounded-md ${showAuthor ? 'mt-2' : ''} py-0.5`}>
          {showAuthor ? (
            <div className='w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold flex-shrink-0 cursor-pointer' onClick={(e) => {e.stopPropagation(); setViewingUser(author)}}>{author?.avatar}</div>
          ) : (
            <div className='w-10 h-10'></div>
          )}
          <div className='flex-1'>
            {showAuthor && (
              <div className='flex items-baseline space-x-2'>
                <span className='font-bold text-white cursor-pointer' onClick={(e) => {e.stopPropagation(); setViewingUser(author)}}>{author?.name}</span>
                <span className='text-xs text-gray-400'>{formatTimestamp(msg.timestamp)}</span>
              </div>
            )}
            {repliedToMessage && repliedToAuthor && ( 
              <div 
                className='flex items-center text-xs text-gray-400 mb-1 cursor-pointer hover:underline'
                onClick={() => handleScrollToMessage(repliedToMessage.id)}
              >
                <ReplyIcon size={12} className='mr-1' />
                <div className='w-4 h-4 mr-1 rounded-full bg-gray-600 flex items-center justify-center font-bold flex-shrink-0 text-xs'>{repliedToAuthor?.avatar}</div>
                <span className='font-bold mr-1'>{repliedToAuthor.name}:</span>
                <span>{repliedToMessage.text?.substring(0, 30)}...</span>
              </div>
            )}
            {msg.text && <p className='text-gray-200'>{msg.text}</p>}
            {msg.file && (
              <div className='mt-2'>
                {msg.file.type.startsWith('image/') ? (
                  <Image src={msg.file.url} alt={msg.file.name} width={200} height={200} className='rounded-md'/>
                ) : (
                <div className='flex items-center bg-gray-800 p-2 rounded-md border border-gray-600'>
                    <FileIcon className='h-6 w-6 mr-2'/>
                    <span>{msg.file.name}</span>
                  </div>
                )}
              </div>
            )}
            <div className='flex items-center space-x-2 mt-2'>
              {msg.reactions && Object.entries(msg.reactions).map(([emoji, userIds]) => (
                userIds.length > 0 && (
                  <div key={emoji} onClick={(e) => {e.stopPropagation(); handleReactionInThread(msg.id, emoji)}} 
                    className={`flex items-center space-x-1 bg-gray-800/70 rounded-full px-2 py-1 cursor-pointer hover:bg-gray-600
                    ${userIds.includes(currentUser.id) ? 'border border-blue-500' : 'border border-transparent'}`}>
                    <span>{emoji}</span>
                    <span className='text-sm font-semibold'>{userIds.length}</span>
                  </div>
                )
              ))}
              {threadReplyCount > 0 && (
                <div onClick={(e) => {e.stopPropagation(); handleOpenNestedThread(msg)}} className='flex items-center space-x-1 text-xs text-blue-600 cursor-pointer hover:underline'>
                  <MessageSquareIcon size={14}/>
                  <span>{threadReplyCount} {threadReplyCount > 1 ? 'replies' : 'reply'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent onCloseAutoFocus={(e: Event) => e.preventDefault()} className='bg-gray-800 border-gray-700 text-white'>
        <DropdownMenuItem onClick={() => setReplyingToMessage(msg)}>Reply</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleOpenNestedThread(msg)}>Open Thread</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Add Reaction</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className='bg-gray-800 border-gray-700 text-white'>
                <DropdownMenuItem onClick={() => handleReactionInThread(msg.id, '👍')}>👍</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReactionInThread(msg.id, '✅')}>✅</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReactionInThread(msg.id, '👀')}>👀</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReactionInThread(msg.id, '❤️')}>❤️</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReactionInThread(msg.id, '😂')}>😂</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
});

ThreadMessageItem.displayName = 'ThreadMessageItem';
