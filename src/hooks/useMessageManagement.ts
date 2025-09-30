
import { useState, useRef, useCallback } from 'react';
import type { Message, User, Channel } from '@/lib/types';
import type { MessageId, UserId, ChannelId } from '@/lib/brandedTypes';

export const useMessageManagement = (
    currentUser: User,
    selectedChannel: Channel | null,
    messages: { [key: number]: Message[] },
    setMessages: React.Dispatch<React.SetStateAction<{[key: number]: Message[]}>>,
    users: { [id: number]: User }
) => {
    const [threadStack, setThreadStack] = useState<Message[]>([]);
    const [dmChannels, setDmChannels] = useState<{ [key: number]: Channel }>({});
    const [selectedDmChannel, setSelectedDmChannel] = useState<Channel | null>(null);
    const [currentMessage, setCurrentMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<MessageId | null>(null);
    const [editedMessageText, setEditedMessageText] = useState('');
    const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);

    const handleDmChannelSelect = useCallback((userId: UserId) => {
        const existingChannel = Object.values(dmChannels).find(channel => channel.name.includes(users[userId].name));
        if (existingChannel) {
            setSelectedDmChannel(existingChannel);
        } else {
            const newChannel: Channel = {
                id: (currentUser.id + userId) as ChannelId,
                name: `DM with ${users[userId].name}`,
            };
            setDmChannels(prev => ({ ...prev, [userId]: newChannel }));
            setSelectedDmChannel(newChannel);
        }
    }, [dmChannels, currentUser.id, users]);

    const handleSendMessage = useCallback(() => {
        console.log('handleSendMessage called'); // Debug log
        if (currentMessage.trim() === '' || !selectedChannel) {
          console.log('handleSendMessage - Message empty or no channel selected'); // Debug log
          return;
        }
        const newMessage: Message = {
          id: Date.now() as MessageId,
          authorId: currentUser.id,
          text: currentMessage,
          timestamp: new Date().toISOString(),
          ...(replyingToMessage && { repliedToMessageId: replyingToMessage.id }),
        };
        console.log('handleSendMessage - newMessage:', newMessage); // Debug log
        setMessages(prev => {
          const updatedMessages = { ...prev, [selectedChannel.id]: [...(prev[selectedChannel.id] || []), newMessage] };
          console.log('handleSendMessage - updatedMessages state:', updatedMessages); // Debug log
          return updatedMessages;
        });
        setCurrentMessage('');
        setReplyingToMessage(null);
      }, [currentMessage, selectedChannel, currentUser.id, replyingToMessage, setMessages]);
    
      const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedChannel) {
          return;
        }
    
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const newFileMessage: Message = {
            id: Date.now() as MessageId,
            authorId: currentUser.id,
            timestamp: new Date().toISOString(),
            file: {
              name: file.name,
              type: file.type,
              url: e.target?.result as string,
            }
          };
          setMessages(prev => ({ ...prev, [selectedChannel.id]: [...(prev[selectedChannel.id] || []), newFileMessage] }));
        };
    
        if (file.type.startsWith('image/')) {
          reader.readAsDataURL(file);
        } else {
            const newFileMessage: Message = {
              id: Date.now() as MessageId,
              authorId: currentUser.id,
              timestamp: new Date().toISOString(),
              file: { name: file.name, type: file.type, url: '' } 
            };
          setMessages(prev => ({ ...prev, [selectedChannel.id]: [...(prev[selectedChannel.id] || []), newFileMessage] }));
        }
        event.target.value = '';
      }, [selectedChannel, currentUser.id, setMessages]);
    
      const handleStartEditMessage = useCallback((message: Message) => {
        if (message.authorId !== currentUser.id) {
          return;
        }
        setEditingMessageId(message.id);
        setEditedMessageText(message.text || '');
      }, [currentUser.id]);
    
      const handleCancelEditMessage = useCallback(() => {
        setEditingMessageId(null);
        setEditedMessageText('');
      }, []);
    
      const handleSaveEditMessage = useCallback(() => {
        if (editingMessageId === null || !selectedChannel) {
          return;
        }
        setMessages(prev => ({
          ...prev,
          [selectedChannel.id]: prev[selectedChannel.id].map(msg =>
            msg.id === editingMessageId ? { ...msg, text: editedMessageText } : msg
          ),
        }));
        setEditingMessageId(null);
        setEditedMessageText('');
      }, [editingMessageId, selectedChannel, editedMessageText, setMessages]);
    
      const handleDeleteMessage = useCallback((messageId: MessageId) => {
        if (!selectedChannel || !window.confirm('정말로 이 메시지를 삭제하시겠습니까?')) {
          return;
        }
        setMessages(prev => ({
          ...prev,
          [selectedChannel.id]: prev[selectedChannel.id].filter(msg => msg.id !== messageId),
        }));
      }, [selectedChannel, setMessages]);
    
      const handleReaction = useCallback((messageId: MessageId, emoji: string) => {
        if (!selectedChannel) {
          return;
        }
        setMessages(prev => ({
          ...prev,
          [selectedChannel.id]: prev[selectedChannel.id].map(msg => {
            if (msg.id === messageId) {
              const reactions = { ...(msg.reactions || {}) };
              const userList = reactions[emoji] || [];
              if (userList.includes(currentUser.id)) {
                reactions[emoji] = userList.filter(id => id !== currentUser.id);
                if (reactions[emoji].length === 0) {
                  delete reactions[emoji];
                }
              } else {
                reactions[emoji] = [...userList, currentUser.id];
              }
              return { ...msg, reactions };
            }
              return msg;
          }),
        }));
      }, [selectedChannel, currentUser.id, setMessages]);
    
      const handleOpenThread = useCallback((message: Message) => {
        setThreadStack([message]);
      }, []);
    
      const handleOpenNestedThread = useCallback((message: Message) => {
        setThreadStack(prev => [...prev, message]);
      }, []);
    
      const handleCloseThread = useCallback(() => {
        setThreadStack([]);
        setReplyingToMessage(null); // Also clear reply state
      }, []);
    
      const handleGoBackInThread = useCallback(() => {
        setThreadStack(prev => prev.slice(0, -1));
      }, []);
    
      const handleCancelReply = useCallback(() => {
        setReplyingToMessage(null);
      }, []);

      const updateMessageRecursively = (msgs: Message[], targetId: MessageId, updateFn: (message: Message) => Message): Message[] => {
        return msgs.map(msg => {
          if (msg.id === targetId) {
            return updateFn(msg);
          }
          if (msg.thread) {
            const updatedThread = updateMessageRecursively(msg.thread, targetId, updateFn);
            if (updatedThread !== msg.thread) {
              return { ...msg, thread: updatedThread };
            }
          }
          return msg;
        });
      };
    
      const handleReplyInThread = useCallback((replyText: string) => {
        const currentThread = threadStack[threadStack.length - 1];
        if (!currentThread || !selectedChannel) {
          return;
        }
        const newReply: Message = {
          id: Date.now() as MessageId,
          authorId: currentUser.id,
          timestamp: new Date().toISOString(),
          ...(replyingToMessage && { repliedToMessageId: replyingToMessage.id }),
          text: replyText,
        };
    
        const updateFn = (messageToUpdate: Message) => ({
          ...messageToUpdate,
          thread: [...(messageToUpdate.thread || []), newReply],
        });
    
        setMessages(prev => ({
          ...prev,
          [selectedChannel.id]: updateMessageRecursively(prev[selectedChannel.id], currentThread.id, updateFn),
        }));
    
        setThreadStack(prev => {
          const newStack = [...prev];
          const updatedCurrentThread = updateFn(currentThread);
          newStack[newStack.length - 1] = updatedCurrentThread;
          return newStack;
        });
    
        setReplyingToMessage(null); // Clear reply state after sending
      }, [threadStack, selectedChannel, currentUser.id, messages, replyingToMessage, setMessages]);
    
      const handleFileUploadInThread = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const currentThread = threadStack[threadStack.length - 1];
        if (!file || !currentThread || !selectedChannel) {
          return;
        }
    
        const processFile = (fileUrl: string) => {
          const newFileMessage: Message = {
            id: Date.now() as MessageId,
            authorId: currentUser.id,
            timestamp: new Date().toISOString(),
            file: { name: file.name, type: file.type, url: fileUrl },
          };
    
          const updateFn = (messageToUpdate: Message) => ({
            ...messageToUpdate,
            thread: [...(messageToUpdate.thread || []), newFileMessage],
          });
    
          setMessages(prev => ({
            ...prev,
            [selectedChannel.id]: updateMessageRecursively(prev[selectedChannel.id], currentThread.id, updateFn),
          }));
    
          setThreadStack(prev => {
            const newStack = [...prev];
            const updatedCurrentThread = updateFn(currentThread);
            newStack[newStack.length - 1] = updatedCurrentThread;
            return newStack;
          });
        };
    
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            processFile(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          processFile('');
        }
        event.target.value = '';
      }, [threadStack, selectedChannel, currentUser.id, messages, setMessages]);

      const handleReactionInThread = useCallback((messageId: MessageId, emoji: string) => {
        const currentThread = threadStack[threadStack.length - 1];
        if (!currentThread || !selectedChannel) {
          return;
        }

        const updateFn = (messageToReact: Message) => {
          const reactions = { ...(messageToReact.reactions || {}) };
          const userList = reactions[emoji] || [];
          if (userList.includes(currentUser.id)) {
            reactions[emoji] = userList.filter(id => id !== currentUser.id);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          } else {
            reactions[emoji] = [...userList, currentUser.id];
          }
          return { ...messageToReact, reactions };
        };

        setMessages(prev => ({
          ...prev,
          [selectedChannel.id]: updateMessageRecursively(prev[selectedChannel.id], currentThread.id, (threadMessage) => ({
            ...threadMessage,
            thread: updateMessageRecursively(threadMessage.thread || [], messageId, updateFn),
          })),
        }));

        setThreadStack(prev => {
          const newStack = [...prev];
          const updatedCurrentThread = {
            ...currentThread,
            thread: updateMessageRecursively(currentThread.thread || [], messageId, updateFn),
          };
          newStack[newStack.length - 1] = updatedCurrentThread;
          return newStack;
        });
      }, [threadStack, selectedChannel, currentUser.id, messages, setMessages]);
    
      const handleDeleteMessageInThread = useCallback((messageIdToDelete: MessageId) => {
        const currentThread = threadStack[threadStack.length - 1];
        if (!currentThread || !selectedChannel || !window.confirm('정말로 이 스레드 메시지를 삭제하시겠습니까?')) {
          return;
        }

        const updateFn = (messageToUpdate: Message) => ({
          ...messageToUpdate,
          thread: (messageToUpdate.thread || []).filter(msg => msg.id !== messageIdToDelete),
        });

        setMessages(prev => ({
          ...prev,
          [selectedChannel.id]: updateMessageRecursively(prev[selectedChannel.id], currentThread.id, updateFn),
        }));

        setThreadStack(prev => {
          const newStack = [...prev];
          const updatedCurrentThread = updateFn(currentThread);
          newStack[newStack.length - 1] = updatedCurrentThread;
          return newStack;
        });
      }, [threadStack, selectedChannel, setMessages]);

      const handleStartEditMessageInThread = useCallback((message: Message) => {
        if (message.authorId !== currentUser.id) {
          return;
        }
        setEditingMessageId(message.id);
        setEditedMessageText(message.text || '');
      }, [currentUser.id]);

      const handleSaveEditMessageInThread = useCallback((messageIdToSave: MessageId) => {
        const currentThread = threadStack[threadStack.length - 1];
        if (!currentThread || !selectedChannel || editingMessageId === null) {
          return;
        }

        const updateFn = (messageToUpdate: Message) => ({
          ...messageToUpdate,
          thread: (messageToUpdate.thread || []).map(msg =>
            msg.id === messageIdToSave ? { ...msg, text: editedMessageText } : msg
          ),
        });

        setMessages(prev => ({
          ...prev,
          [selectedChannel.id]: updateMessageRecursively(prev[selectedChannel.id], currentThread.id, updateFn),
        }));

        setThreadStack(prev => {
          const newStack = [...prev];
          const updatedCurrentThread = updateFn(currentThread);
          newStack[newStack.length - 1] = updatedCurrentThread;
          return newStack;
        });

        setEditingMessageId(null);
        setEditedMessageText('');
      }, [threadStack, selectedChannel, editingMessageId, editedMessageText, setMessages]);

    return {
        threadStack,
        dmChannels, setDmChannels,
        selectedDmChannel, setSelectedDmChannel,
        currentMessage, setCurrentMessage,
        messagesEndRef,
        fileInputRef,
        viewingUser, setViewingUser,
        editingMessageId,
        editedMessageText, setEditedMessageText,
        replyingToMessage, setReplyingToMessage,
        handleSendMessage,
        handleFileUpload,
        handleStartEditMessage,
        handleCancelEditMessage,
        handleSaveEditMessage,
        handleDeleteMessage,
        handleReaction,
        handleOpenThread,
        handleOpenNestedThread,
        handleCloseThread,
        handleGoBackInThread,
        handleReplyInThread,
        handleFileUploadInThread,
        handleReactionInThread,
        handleCancelReply,
        handleDmChannelSelect,
        handleDeleteMessageInThread,
        handleStartEditMessageInThread,
        handleSaveEditMessageInThread,
    };
};
