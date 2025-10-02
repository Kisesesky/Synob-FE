'use client';

import React, { useState, useRef } from 'react';
import NextImage from 'next/image';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent,
  DropdownMenuSubTrigger, DropdownMenuTrigger, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { File as FileIcon, MessageSquare as MessageSquareIcon, Reply as ReplyIcon, Edit as EditIcon, Trash2 as TrashIcon, Smile, Eye as EyeIcon, Download as DownloadIcon } from 'lucide-react';
import type { Message } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';
import { ImageViewerModal } from '@/components/ImageViewerModal'; // New import
import { formatTimestamp, parseMarkdownToHtml, replaceEmojiShortcuts } from '../../lib/utils'; // Import formatTimestamp and parseMarkdownToHtml
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EMOJI_CATEGORIES } from '@/lib/emojis';
import { EmojiPickerContent } from '@/components/EmojiPicker';
import { Pin as PinIcon } from 'lucide-react';

export const MessageItem = React.memo(({
  msg,
  prevMsg,
  isSearchResult = false,
  repliedToMessage, // Accept repliedToMessage prop directly
}: { msg: Message; prevMsg: Message | null; isSearchResult?: boolean; repliedToMessage: Message | null; }) => {
  const [isMessageHovered, setIsMessageHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isReactionMenuOpen, setIsReactionMenuOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false); // New state
  const [imageViewerSrc, setImageViewerSrc] = useState(''); // New state
  const [imageViewerFileName, setImageViewerFileName] = useState(''); // New state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const {
    users,
    currentUser,
    selectedServer,
    contextMenu,
    setContextMenu,
    setViewingUser,
    editingMessageId,
    editedMessageText,
    setEditedMessageText,
    handleSaveEditMessage,
    handleCancelEditMessage,
    handleReaction,
    handleOpenThread,
    handleStartEditMessage,
    handleDeleteMessage,
    setReplyingToMessage,
    editFileInputRef,
    editingFile,
    handleFileEditUpload,
    handleRemoveEditingFile,
    togglePinMessage,
  } = useAppContext();
  const author = users[msg.authorId];

  let showAuthor = !prevMsg || prevMsg.authorId !== msg.authorId || isSearchResult;

  if (!showAuthor && prevMsg && prevMsg.authorId === msg.authorId) {
    const timeDiff = new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime();
    const fiveMinutes = 60 * 1000;
    if (timeDiff > fiveMinutes) {
      showAuthor = true;
    }
  }
  let channelName = '';
  
  if (isSearchResult) {
    selectedServer.categories.forEach(cat => {
      const foundChannel = cat.channels.find(chan => chan.id === msg.channelId);
      if (foundChannel) {
        channelName = foundChannel.name;
      }
    });
  }

  const threadReplyCount = msg.thread?.length || 0;

  const repliedToAuthor = repliedToMessage ? users[repliedToMessage.authorId] : null;

  const handleScrollToMessage = (messageId: import('@/lib/brandedTypes').MessageId) => {
    const element = document.getElementById(`message-${messageId}`);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <React.Fragment>
      <div 
        id={`message-${msg.id}`} // Add unique ID for each message
        onMouseEnter={() => {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = setTimeout(() => setIsMessageHovered(true), 300);
        }}
        onMouseLeave={() => {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = setTimeout(() => setIsMessageHovered(false), 100);
        }}
        onContextMenu={(e) => { 
          e.preventDefault(); 
          setContextMenu({ 
            type: 'message', 
            id: msg.id, 
            x: e.clientX, 
            y: e.clientY 
          }); 
        }}
        className={`group relative flex items-start space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-md ${showAuthor ? 'mt-2' : ''} ${threadReplyCount > 0 || (msg.reactions && Object.keys(msg.reactions).length > 0) ? 'py-2' : 'py-0.5'}`}>
        {showAuthor ? (
          <div className='w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer' onClick={(e) => {e.stopPropagation(); setViewingUser(author)}}>
            {author?.avatarUrl ? (
              <NextImage src={author.avatarUrl} alt={author.fullName || author.nickname || 'Unknown'} width={40} height={40} objectFit="cover" />
            ) : (
              <div className="w-full h-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center font-bold">
                {(author?.fullName || author?.nickname || '?')[0]}
              </div>
            )}
          </div>
        ) : (
          <div className='w-10 h-10'></div>
        )}
        <div className='flex-1'>
          {repliedToMessage && repliedToAuthor && ( // Display replied-to message preview
            <div 
              className='flex items-center text-xs text-gray-700 dark:text-gray-400 mb-1 cursor-pointer hover:underline'
              onClick={() => handleScrollToMessage(repliedToMessage.id)}
            >
              <ReplyIcon size={12} className='mr-1' />
              <div className='w-5 h-5 mr-2 rounded-full overflow-hidden flex-shrink-0'>
                {repliedToAuthor?.avatarUrl ? (
                  <NextImage src={repliedToAuthor.avatarUrl} alt={repliedToAuthor.fullName || repliedToAuthor.nickname || 'Unknown'} width={20} height={20} objectFit="cover" />
                ) : (
                  <div className="w-full h-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center font-bold text-xs">
                    {(repliedToAuthor?.fullName || repliedToAuthor?.nickname || '?')[0]}
                  </div>
                )}
              </div>
              <span className='font-bold mr-1'>{repliedToAuthor.fullName || repliedToAuthor.nickname || 'Unknown'}:</span>
              <span>{repliedToMessage.text?.substring(0, 30)}...</span>
            </div>
          )}
          {showAuthor && (
            <div className='flex items-baseline space-x-2'>
              <span className='font-bold text-black dark:text-white cursor-pointer' onClick={(e) => {e.stopPropagation(); setViewingUser(author)}}>{author?.fullName || author?.nickname || 'Unknown'}</span>
              <span className='text-xs text-gray-700 dark:text-gray-400'>{formatTimestamp(msg.timestamp)}</span>
              {isSearchResult && channelName && <span className='text-xs text-gray-700 dark:text-gray-500'>(in #{channelName})</span>}
            </div>
          )}
              
          {editingMessageId === msg.id ? (
            <div className="w-full">
              {editingFile && (
                <div className="mt-2 flex items-center gap-2">
                  <FileIcon className="h-5 w-5"/>
                  <span className="text-sm truncate">{editingFile.name}</span>
                  <button onClick={() => editFileInputRef.current?.click()} className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-2 py-1 rounded">Replace</button>
                  <button onClick={handleRemoveEditingFile} className="text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded">Remove</button>
                </div>
              )}
              <input type="file" ref={editFileInputRef} onChange={handleFileEditUpload} className="hidden" />
              <Input type='text' value={editedMessageText} onChange={(e) => setEditedMessageText(e.target.value)}
                className='bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-500 text-black dark:text-white mt-1 w-full'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEditMessage();
                  }
                  if (e.key === 'Escape') {
                    handleCancelEditMessage();
                  }
                }} />
              <div className='text-xs text-gray-700 dark:text-gray-400 mt-1'>Enter to save, Esc to cancel</div>
            </div>
          ) : (
            <>
              {msg.text && <p className='text-gray-800 dark:text-gray-200' dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(replaceEmojiShortcuts(msg.text)) }}></p>}
              {msg.file && (
                <div className='mt-2'>
                  {msg.file.type.startsWith('image/') ? (
                    <button
                      onClick={() => {
                        setImageViewerSrc(msg.file?.url || '');
                        setImageViewerFileName(msg.file?.name || '');
                        setIsImageViewerOpen(true);
                      }}
                      className='block cursor-pointer'
                    >
                      <NextImage src={msg.file?.url || ''} alt={msg.file?.name || 'File'} width={200} height={200} className='rounded-md'/>
                    </button>
                  ) : (
                    <a href={msg.file.url} download={msg.file.name} target="_blank" rel="noopener noreferrer" className='flex items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer'>
                      <FileIcon className='h-5 w-5 mr-2'/>
                      <span>{msg.file.name}</span>
                    </a>
                  )}
                </div>
              )}
            </>
          )}
          <div className='flex items-center space-x-1 mt-1'>
            {msg.reactions && Object.entries(msg.reactions).map(([emoji, userIds]) => (
              userIds.length > 0 && (
                <div key={emoji} onClick={(e) => {e.stopPropagation(); handleReaction(msg.id, emoji)}} 
                  className={`flex items-center space-x-1 bg-gray-100 dark:bg-gray-800/70 rounded-xl px-2 py-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600
                  ${currentUser && userIds.includes(currentUser.id) ? 'border border-blue-500' : 'border border-transparent'}`}>
                  <span className='text-sm'>{emoji}</span>
                  <span className='text-sm font-semibold'>{userIds.length}</span>
                </div>
              )
            ))}
            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
              <DropdownMenu open={isReactionMenuOpen} onOpenChange={setIsReactionMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button className='flex items-center space-x-1 bg-gray-100 dark:bg-gray-800/70 rounded-full px-2 py-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600'>
                    <Smile className="h-5 w-5 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-black dark:text-white p-2 grid grid-cols-8 gap-1 max-h-60 overflow-y-auto'>
                  {Object.entries(EMOJI_CATEGORIES).map(([categoryName, emojis]) => (
                    <React.Fragment key={categoryName}>
                      {emojis.map(emojiItem => (
                        <DropdownMenuItem key={emojiItem.emoji} onClick={() => handleReaction(msg.id, emojiItem.emoji)} className='flex items-center justify-center p-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600'>
                          {emojiItem.emoji}
                        </DropdownMenuItem>
                      ))}
                    </React.Fragment>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {threadReplyCount > 0 && (
              <div onClick={(e) => {e.stopPropagation(); handleOpenThread(msg)}} className='flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline'>
                <MessageSquareIcon size={14}/>
                <span>{threadReplyCount} {threadReplyCount > 1 ? 'replies' : 'reply'}</span>
              </div>
            )}
          </div>
          {isMessageHovered && (
            <div className='absolute -top-4 right-0 flex space-x-1 bg-gray-100 dark:bg-gray-800/70 p-1 rounded-md shadow-lg'>
              <button onClick={() => handleReaction(msg.id, '👍')} className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md' title='React'>
                👍
              </button>
              <button onClick={() => handleReaction(msg.id, '✅')} className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md' title='React'>
                ✅
              </button>
              <button onClick={() => handleReaction(msg.id, '👀')} className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md' title='React'>
                👀
              </button>
              <button onClick={() => handleReaction(msg.id, '❤️')} className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md' title='React'>
                ❤️
              </button>
              <button onClick={() => setReplyingToMessage(msg)} className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md' title='Reply'>
                <ReplyIcon size={16} />
              </button>
              <button onClick={() => handleOpenThread(msg)} className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md' title='Thread'>
                <MessageSquareIcon size={16} />
              </button>
              {currentUser && msg.authorId === currentUser!.id && (
                <>
                  <button onClick={() => handleStartEditMessage(msg)} className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md' title='Edit'>
                    <EditIcon size={16} />
                  </button>
                  <button onClick={() => handleDeleteMessage(msg.id)} className='p-1 hover:bg-gray-600 rounded-md text-red-500' title='Delete'>
                    <TrashIcon size={16} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <DropdownMenu
        open={contextMenu?.type === 'message' && contextMenu.id === msg.id}
        onOpenChange={(isOpen) => !isOpen && setContextMenu(null)}
      >
        <DropdownMenuTrigger asChild>
          <div style={{ position: 'fixed', top: contextMenu?.y ?? 0, left: contextMenu?.x ?? 0 }} />
        </DropdownMenuTrigger>
        <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-black dark:text-white'>
          {msg.file && msg.file.type.startsWith('image/') && (
            <DropdownMenuItem onClick={() => {
              setImageViewerSrc(msg.file?.url || '');
              setImageViewerFileName(msg.file?.name || '');
              setIsImageViewerOpen(true);
            }} className='flex items-center'>
              <EyeIcon className='h-4 w-4 mr-2' /> View Image
            </DropdownMenuItem>
          )}
          {msg.file && (
            <DropdownMenuItem onClick={() => {
              const link = document.createElement('a');
              link.href = msg.file?.url || '';
              link.download = msg.file && msg.file.name ? msg.file.name : 'download';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }} className='flex items-center'>
              <DownloadIcon className='h-4 w-4 mr-2' /> Save File
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => handleOpenThread(msg)} className='flex items-center'>
            <MessageSquareIcon className='h-4 w-4 mr-2' /> Thread
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => togglePinMessage(msg.id)} className='flex items-center'>
            <PinIcon className='h-4 w-4 mr-2' /> {msg.isPinned ? 'Unpin Message' : 'Pin Message'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setReplyingToMessage(msg)} className='flex items-center'>
            <ReplyIcon className='h-4 w-4 mr-2' /> Reply
          </DropdownMenuItem> {/* New Reply button */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Add Reaction</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-black dark:text-white'>
                <DropdownMenuItem onClick={() => handleReaction(msg.id, '👍')}>👍</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReaction(msg.id, '✅')}>✅</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReaction(msg.id, '👀')}>👀</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReaction(msg.id, '❤️')}>❤️</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPickerOpen(true)}>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          {currentUser && msg.authorId === currentUser!.id && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStartEditMessage(msg)} className='flex items-center'><EditIcon className='h-4 w-4 mr-2' /> Edit Message</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteMessage(msg.id)} className='text-red-500 flex items-center'><TrashIcon className='h-4 w-4 mr-2' /> Delete Message</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {isImageViewerOpen && (
        <ImageViewerModal
          src={imageViewerSrc}
          alt={imageViewerFileName}
          fileName={imageViewerFileName}
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
        />
      )}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="bg-transparent border-none shadow-none p-0 w-auto">
          <EmojiPickerContent onSelect={(emoji) => {
            handleReaction(msg.id, emoji);
            setIsPickerOpen(false);
          }} />
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
});

MessageItem.displayName = 'MessageItem';
