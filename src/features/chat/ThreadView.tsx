import { useState, useRef } from 'react';
import { X, Plus, ArrowLeft } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
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
  } = useAppContext();

  const [reply, setReply] = useState('');
  const threadFileInputRef = useRef<HTMLInputElement>(null);

  if (threadStack.length === 0) {
    return null;
  }

  const currentThread = threadStack[threadStack.length - 1];

  const handleSendReply = () => {
    if (reply.trim() === '') {
      return;
    }
    handleReplyInThread(reply);
    setReply('');
  };

  const repliedToAuthor = replyingToMessage ? users[replyingToMessage.authorId] : null;

  return (
    <div className='h-full bg-gray-900 border-l border-gray-700 flex flex-col z-10'>
      <div className='p-3 border-b border-gray-700 flex justify-between items-center'>
        <div className='flex items-center'>
          {threadStack.length > 1 && (
            <button onClick={handleGoBackInThread} className='mr-2'>
              <ArrowLeft size={20} className='text-white'/>
            </button>
          )}
          <h3 className='font-bold text-white'>Thread</h3>
        </div>
        <button onClick={handleCloseThread}>
          <X size={20} className='text-white'/>
        </button>
      </div>
      
      <div className='flex-1 overflow-y-auto p-4 space-y-0'>
        <ThreadMessageItem msg={currentThread} author={users[currentThread.authorId]} prevMsg={null} />
        <div className='relative flex justify-center items-center my-4'>
          <span className='flex-shrink text-sm text-gray-400'>
            {(currentThread.thread || []).length} replies
          </span>
          <div className='flex-grow border-t border-gray-700 mx-3'></div>
        </div>

        {(currentThread.thread || []).map((replyMsg, index, arr) => (
          <ThreadMessageItem 
            key={replyMsg.id} 
            msg={replyMsg} 
            author={users[replyMsg.authorId]}
            prevMsg={index === 0 ? currentThread : arr[index - 1]}
          />
        ))}
      </div>

      <div className='p-4'>
        {replyingToMessage && (
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
            <input type='file' ref={threadFileInputRef} onChange={handleFileUploadInThread} className='hidden' />
            <Plus className='h-6 w-6 text-gray-400 mx-2 cursor-pointer hover:text-white' onClick={() => threadFileInputRef.current?.click()}/>
            <input 
              type='text' 
              placeholder={replyingToMessage ? `Replying to ${repliedToAuthor?.name}...` : 'Reply...'} 
              className='flex-1 bg-transparent focus:outline-none text-white'
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
            />
        </div>
      </div>
    </div>
  )
}
