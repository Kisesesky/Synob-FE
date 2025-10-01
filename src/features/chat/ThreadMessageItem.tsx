import * as React from 'react';
import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { File as FileIcon, Reply as ReplyIcon, MessageSquare as MessageSquareIcon, Smile, Eye as EyeIcon, Download as DownloadIcon, Edit as EditIcon, Trash2 as TrashIcon } from 'lucide-react';
import type { Message, User } from '@/lib/types';
import { ImageViewerModal } from '@/components/ImageViewerModal';
import type { MessageId } from '@/lib/brandedTypes';
import { useAppContext } from '@/contexts/AppContext';
import { formatTimestamp, parseMarkdownToHtml, replaceEmojiShortcuts } from '../../lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EMOJI_CATEGORIES } from '@/lib/emojis';
import { EmojiPickerContent } from '@/components/EmojiPicker';
import { Pin as PinIcon } from 'lucide-react';

export const ThreadMessageItem = React.memo(({
  msg,
  author,
  prevMsg,
  onDelete,
  onEditStart,
  onEditSave,
  onEditCancel,
  isEditing,
  editedText,
  setEditedText,
}: {
  msg: Message;
  author: User;
  prevMsg: Message | null;
  onDelete: (messageId: MessageId) => void;
  onEditStart: (message: Message) => void;
  onEditSave: (messageId: MessageId) => void;
  onEditCancel: () => void;
  isEditing: boolean;
  editedText: string;
  setEditedText: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [isMessageHovered, setIsMessageHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isReactionMenuOpen, setIsReactionMenuOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false); // New state
  const [imageViewerSrc, setImageViewerSrc] = useState(''); // New state
  const [imageViewerFileName, setImageViewerFileName] = useState(''); // New state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
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
    editFileInputRef,
    editingFile,
    handleFileEditUpload,
    handleRemoveEditingFile,
    togglePinMessage,
  } = useAppContext();
  let showAuthor = !prevMsg || prevMsg.authorId !== msg.authorId;

  if (!showAuthor && prevMsg && prevMsg.authorId === msg.authorId) {
    const timeDiff = new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime();
    const fiveMinutes = 60 * 1000;
    if (timeDiff > fiveMinutes) {
      showAuthor = true;
    }
  }

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
    <React.Fragment>
      <div 
        id={`thread-message-${msg.id}`}
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
            type: 'thread_message', 
            id: msg.id, 
            x: e.clientX, 
            y: e.clientY 
          }); 
        }}
        className={`group relative flex items-start space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-md ${showAuthor ? 'mt-2' : ''} py-0.5`}>
        {showAuthor ? (
          <div className='w-10 h-10 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center font-bold flex-shrink-0 cursor-pointer' onClick={(e) => {e.stopPropagation(); setViewingUser(author)}}>{author?.avatar}</div>
        ) : (
          <div className='w-10 h-10'></div>
        )}
        <div className='flex-1'>
          {showAuthor && (
            <div className='flex items-baseline space-x-2'>
              <span className='font-bold text-black dark:text-white cursor-pointer' onClick={(e) => {e.stopPropagation(); setViewingUser(author)}}>{author?.name}</span>
              <span className='text-xs text-gray-700 dark:text-gray-400'>{formatTimestamp(msg.timestamp)}</span>
            </div>
          )}
          {repliedToMessage && repliedToAuthor && ( 
            <div 
              className='flex items-center text-xs text-gray-700 dark:text-gray-400 mb-1 cursor-pointer hover:underline'
              onClick={() => handleScrollToMessage(repliedToMessage.id)}
            >
              <ReplyIcon size={12} className='mr-1' />
              <div className='w-4 h-4 mr-1 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center font-bold flex-shrink-0 text-xs'>{repliedToAuthor?.avatar}</div>
              <span className='font-bold mr-1'>{repliedToAuthor.name}:</span>
              <span>{repliedToMessage.text?.substring(0, 30)}...</span>
            </div>
          )}
          {isEditing ? (
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
              <input
                type='text'
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onEditSave(msg.id);
                  } else if (e.key === 'Escape') {
                    onEditCancel();
                  }
                }}
                className='bg-gray-100 dark:bg-gray-700 text-black dark:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full mt-1'
              />
              <div className='flex space-x-2 text-xs text-gray-700 dark:text-gray-400 mt-1'>
                <button onClick={() => onEditCancel()} className='hover:underline'>Cancel</button>
                <button onClick={() => onEditSave(msg.id)} className='text-blue-500 hover:underline'>Save</button>
              </div>
            </div>
          ) : (
            msg.text && <p className='text-gray-800 dark:text-gray-200' dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(replaceEmojiShortcuts(msg.text)) }}></p>
          )}
          {msg.file && (
            <div className='mt-2'>
              {msg.file.type.startsWith('image/') ? (
                <button
                  onClick={() => {
                    setImageViewerSrc(msg.file!.url);
                    setImageViewerFileName(msg.file!.name);
                    setIsImageViewerOpen(true);
                  }}
                  className='block cursor-pointer'
                >
                  <Image src={msg.file.url} alt={msg.file.name} width={200} height={200} className='rounded-md'/>
                </button>
              ) : (
                <a href={msg.file.url} download={msg.file.name} target="_blank" rel="noopener noreferrer" className='flex items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer'>
                  <FileIcon className='h-5 w-5 mr-2'/>
                  <span>{msg.file.name}</span>
                </a>
              )}
            </div>
          )}
          <div className='flex items-center space-x-2 mt-2'>
            {msg.reactions && Object.entries(msg.reactions).map(([emoji, userIds]) => (
              userIds.length > 0 && (
                <div key={emoji} onClick={(e) => {e.stopPropagation(); handleReactionInThread(msg.id, emoji)}}
                  className={`flex items-center space-x-1 bg-gray-100 dark:bg-gray-800/70 rounded-full px-2 py-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600
                  ${userIds.includes(currentUser.id) ? 'border border-blue-500' : 'border border-transparent'}`}>
                  <span>{emoji}</span>
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
                        <DropdownMenuItem key={emojiItem.emoji} onClick={() => handleReactionInThread(msg.id, emojiItem.emoji)} className='flex items-center justify-center p-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600'>
                          {emojiItem.emoji}
                        </DropdownMenuItem>
                      ))}
                    </React.Fragment>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {threadReplyCount > 0 && (
              <div onClick={(e) => {e.stopPropagation(); handleOpenNestedThread(msg)}} className='flex items-center space-x-1 text-xs text-blue-600 cursor-pointer hover:underline'>
                <MessageSquareIcon size={14}/>
                <span>{threadReplyCount} {threadReplyCount > 1 ? 'replies' : 'reply'}</span>
              </div>
            )}
          </div>
          {isMessageHovered && (
            <div className='absolute -top-4 right-0 flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-md shadow-lg'>
              <button onClick={() => setReplyingToMessage(msg)} className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md' title='Reply'>
                <ReplyIcon size={16} />
              </button>
              <button onClick={() => handleReactionInThread(msg.id, '👍')} className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md' title='React'>
                👍
              </button>
              <button onClick={() => handleReactionInThread(msg.id, '✅')} className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md' title='React'>
                ✅
              </button>
              <button onClick={() => handleReactionInThread(msg.id, '👀')} className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md' title='React'>
                👀
              </button>
              <button onClick={() => handleReactionInThread(msg.id, '❤️')} className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md' title='React'>
                ❤️
              </button>
              {msg.authorId === currentUser.id && (
                <>
                  <button onClick={() => onEditStart(msg)} className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md' title='Edit'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </button>
                  <button onClick={() => onDelete(msg.id)} className='p-1 hover:bg-gray-600 rounded-md' title='Delete'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </>
              )}
            </div>
          )}        
        </div>
      </div>
      <DropdownMenu
        open={contextMenu?.type === 'thread_message' && contextMenu.id === msg.id}
        onOpenChange={(isOpen: boolean) => !isOpen && setContextMenu(null)}
      >
        <DropdownMenuTrigger asChild>
          <div style={{ position: 'fixed', top: contextMenu?.y ?? 0, left: contextMenu?.x ?? 0 }} />
        </DropdownMenuTrigger>
        <DropdownMenuContent onCloseAutoFocus={(e: Event) => e.preventDefault()} className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-black dark:text-white'>
          {msg.file && msg.file.type.startsWith('image/') && (
            <DropdownMenuItem onClick={() => {
              setImageViewerSrc(msg.file!.url);
              setImageViewerFileName(msg.file!.name);
              setIsImageViewerOpen(true);
            }} className='flex items-center'>
              <EyeIcon className='h-4 w-4 mr-2' /> View Image
            </DropdownMenuItem>
          )}
          {msg.file && (
            <DropdownMenuItem onClick={() => {
              const link = document.createElement('a');
              link.href = msg.file!.url;
              link.download = msg.file!.name;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }} className='flex items-center'>
              <DownloadIcon className='h-4 w-4 mr-2' /> Save File
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setReplyingToMessage(msg)} className='flex items-center'>
            <ReplyIcon className='h-4 w-4 mr-2' /> Reply
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenNestedThread(msg)} className='flex items-center'>
            <MessageSquareIcon className='h-4 w-4 mr-2' /> Thread
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => togglePinMessage(msg.id)} className='flex items-center'>
            <PinIcon className='h-4 w-4 mr-2' /> {msg.isPinned ? 'Unpin Message' : 'Pin Message'}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Add Reaction</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-black dark:text-white'>
                <DropdownMenuItem onClick={() => handleReactionInThread(msg.id, '👍')}>👍</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReactionInThread(msg.id, '✅')}>✅</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReactionInThread(msg.id, '👀')}>👀</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReactionInThread(msg.id, '❤️')}>❤️</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPickerOpen(true)}>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          {msg.authorId === currentUser.id && (
            <>
              <DropdownMenuItem onClick={() => onEditStart(msg)} className='flex items-center'><EditIcon className='h-4 w-4 mr-2' /> Edit Message</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(msg.id)} className='text-red-500 flex items-center'><TrashIcon className='h-4 w-4 mr-2' /> Delete Message</DropdownMenuItem>
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
            handleReactionInThread(msg.id, emoji);
            setIsPickerOpen(false);
          }} />
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
});

ThreadMessageItem.displayName = 'ThreadMessageItem';
