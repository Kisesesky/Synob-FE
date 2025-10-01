import { AppContextType, useAppContext } from '@/contexts/AppContext';
import { ArrowLeft, File as FileIcon, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { ThreadMessageItem } from './ThreadMessageItem';

export const ThreadView = () => {
  const {
    threadStack,
    users,
    handleCloseThread,
    handleGoBackInThread,
    handleReplyInThread,
    handleFileUploadInThread,
    replyingToMessage,
    handleCancelReply,
    handleDeleteMessageInThread,
    handleStartEditMessageInThread,
    handleSaveEditMessageInThread,
    editingMessageId,
    editedMessageText,
    setEditedMessageText,
    handleCancelEditMessage,
    pendingFile,
    handleRemovePendingFile,
  } = useAppContext();
  const [reply, setReply] = useState('');
  const threadFileInputRef = useRef<HTMLInputElement>(null);

  if (threadStack.length === 0) {
    return null;
  }

  const currentThread = threadStack[threadStack.length - 1];

  const handleSendReply = () => {
    // Allow sending if there's a pending file, even if reply text is empty
    if (reply.trim() === '' && !pendingFile) {
      return;
    }
    handleReplyInThread(reply);
    setReply('');
  };

  const repliedToAuthor = replyingToMessage ? users[replyingToMessage.authorId] : null;

  return (
    <div className='h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col z-10'>
      <div className='p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center'>
        <div className='flex items-center'>
          {threadStack.length > 1 && (
            <button onClick={handleGoBackInThread} className='mr-2'>
              <ArrowLeft size={20} className='text-black dark:text-white'/>
            </button>
          )}
          <h3 className='font-bold text-black dark:text-white'>Thread</h3>
        </div>
        <button onClick={handleCloseThread}>
          <X size={20} className='text-black dark:text-white'/>
        </button>
      </div>
      
      <div className='flex-1 overflow-y-auto p-4 space-y-0'>
        <ThreadMessageItem 
          msg={currentThread} 
          author={users[currentThread.authorId]} 
          prevMsg={null}
          onDelete={handleDeleteMessageInThread}
          onEditStart={handleStartEditMessageInThread}
          onEditSave={handleSaveEditMessageInThread}
          onEditCancel={handleCancelEditMessage}
          isEditing={editingMessageId === currentThread.id}
          editedText={editedMessageText}
          setEditedText={setEditedMessageText}
        />
        <div className='relative flex justify-center items-center my-4'>
          <span className='flex-shrink text-sm text-gray-700 dark:text-gray-400'>
            {(currentThread.thread || []).length} replies
          </span>
          <div className='flex-grow border-t border-gray-200 dark:border-gray-700 mx-3'></div>
        </div>

        {(currentThread.thread || []).map((replyMsg, index, arr) => (
          <ThreadMessageItem 
            key={replyMsg.id} 
            msg={replyMsg} 
            author={users[replyMsg.authorId]}
            prevMsg={index === 0 ? currentThread : arr[index - 1]}
            onDelete={handleDeleteMessageInThread}
            onEditStart={handleStartEditMessageInThread}
            onEditSave={handleSaveEditMessageInThread}
            onEditCancel={handleCancelEditMessage}
            isEditing={editingMessageId === replyMsg.id}
            editedText={editedMessageText}
            setEditedText={setEditedMessageText}
          />
        ))}
      </div>

      <div className='p-4'>
        {replyingToMessage && (
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
          <div className={`relative flex items-center bg-gray-100 dark:bg-gray-700 p-2 pr-8 ${replyingToMessage ? 'rounded-t-none' : 'rounded-t-lg'} border-b border-gray-200 dark:border-gray-600 shadow-md`}>
            <div className='flex items-center flex-grow'>
              {pendingFile.type.startsWith('image/') ? (
                <img src={pendingFile.url} alt="Preview" className='h-12 w-12 object-cover rounded-md mr-2' />
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
          <input type='file' ref={threadFileInputRef} onChange={handleFileUploadInThread} className='hidden' />
          <Plus className='h-6 w-6 text-gray-700 dark:text-gray-400 mx-2 cursor-pointer hover:text-gray-900 dark:hover:text-white' onClick={() => threadFileInputRef.current?.click()}/>
          <input 
            type='text' 
            placeholder={replyingToMessage ? `Replying to ${repliedToAuthor?.name}...` : 'Reply...'} 
            className='flex-1 bg-transparent focus:outline-none text-black dark:text-white'
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
          />
        </div>
      </div>
    </div>
  )
}
