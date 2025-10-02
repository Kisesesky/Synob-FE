import { useState, useRef, useCallback, useEffect } from 'react';
import type { Message, User, Channel } from '@/lib/types';
import type { MessageId, UserId, ChannelId } from '@/lib/brandedTypes';
import { toast } from 'sonner';
import { INITIAL_USERS } from '@/lib/mockData';

export const useMessageManagement = (
  currentUser: User,
  selectedChannel: Channel | null,
  messages: { [key: number]: Message[] },
  setMessages: React.Dispatch<React.SetStateAction<{[key: number]: Message[]}>>
) => {
  const [users, setUsers] = useState<{ [id: number]: User }>(INITIAL_USERS);

  // Update users state when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUsers(prevUsers => ({
        ...prevUsers,
        [currentUser.id]: currentUser,
      }));
    }
  }, [currentUser]); // Dependency array includes currentUser

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
  const [pendingFile, setPendingFile] = useState<{ name: string; type: string; url: string; fileObject?: File; } | null>(null);
  const [editingFile, setEditingFile] = useState<{ name: string; type: string; url: string; fileObject?: File } | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [isPinnedMessagesOpen, setIsPinnedMessagesOpen] = useState(false);

  const sendFriendRequest = useCallback((targetUserId: UserId) => {
    setUsers(prevUsers => {
      const targetUser = prevUsers[targetUserId];
      if (!targetUser || targetUser.incomingFriendRequests?.includes(currentUser.id)) {
          toast.info('Friend request already sent.');
          return prevUsers;
      }
      if (targetUser.friendIds?.includes(currentUser.id)) {
          toast.info('Already friends.');
          return prevUsers;
      }

      const updatedTargetUser = {
          ...targetUser,
          incomingFriendRequests: [...(targetUser.incomingFriendRequests || []), currentUser.id],
      };

      toast.success(`Friend request sent to ${targetUser.name}`);
      return { ...prevUsers, [targetUserId]: updatedTargetUser };
    });
  }, [currentUser.id]);

  const acceptFriendRequest = useCallback((requestingUserId: UserId) => {
    setUsers(prevUsers => {
      const currentUserData = prevUsers[currentUser.id];
      const requestingUserData = prevUsers[requestingUserId];

      // 1. Remove from current user's incoming requests
      const updatedCurrentUser = {
        ...currentUserData,
        incomingFriendRequests: (currentUserData.incomingFriendRequests || []).filter(id => id !== requestingUserId),
        friendIds: [...(currentUserData.friendIds || []), requestingUserId],
      };

      // 2. Add to requesting user's friends list
      const updatedRequestingUser = {
        ...requestingUserData,
        friendIds: [...(requestingUserData.friendIds || []), currentUser.id],
      };

      toast.success(`${requestingUserData.name} is now your friend.`);
      return {
        ...prevUsers,
        [currentUser.id]: updatedCurrentUser,
        [requestingUserId]: updatedRequestingUser,
      };
    });
  }, [currentUser.id]);

  const declineFriendRequest = useCallback((requestingUserId: UserId) => {
    setUsers(prevUsers => {
      const currentUserData = prevUsers[currentUser.id];
      const updatedCurrentUser = {
        ...currentUserData,
        incomingFriendRequests: (currentUserData.incomingFriendRequests || []).filter(id => id !== requestingUserId),
      };
      toast.info('Friend request declined.');
      return { ...prevUsers, [currentUser.id]: updatedCurrentUser };
    });
  }, [currentUser.id]);

  const removeFriend = useCallback((friendId: UserId) => {
    setUsers(prevUsers => {
      const currentUserData = prevUsers[currentUser.id];
      const friendData = prevUsers[friendId];

      // 1. Remove from current user's friends list
      const updatedCurrentUser = {
        ...currentUserData,
        friendIds: (currentUserData.friendIds || []).filter(id => id !== friendId),
      };

      // 2. Remove from friend's friends list
      const updatedFriend = {
        ...friendData,
        friendIds: (friendData.friendIds || []).filter(id => id !== currentUser.id),
      };

      toast.error(`${friendData.name} has been removed from your friends.`);
      return {
        ...prevUsers,
        [currentUser.id]: updatedCurrentUser,
        [friendId]: updatedFriend,
      };
    });
  }, [currentUser.id]);

      const togglePinMessage = useCallback((messageId: MessageId) => {
          if (!selectedChannel) return;
  
          setMessages(prevMessages => {
              console.log(`togglePinMessage: Toggling message ${messageId} in channel ${selectedChannel.id}`);
              const updatedChannelMessages = prevMessages[selectedChannel.id].map(msg => {
                  if (msg.id === messageId) {
                      console.log(`togglePinMessage: Message ${messageId} found. Current isPinned: ${msg.isPinned}, New isPinned: ${!msg.isPinned}`);
                      return { ...msg, isPinned: !msg.isPinned };
                  }
                  return msg;
              });
              const newMessagesState = { ...prevMessages, [selectedChannel.id]: updatedChannelMessages };
              console.log('togglePinMessage: New messages state after toggle:', newMessagesState);
              return newMessagesState;
          });
      }, [selectedChannel, setMessages]);
  const handleFileEditUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      setEditingFile({
        name: file.name,
        type: file.type,
        url: e.target?.result as string,
        fileObject: file,
      });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }, []);

  const handleRemoveEditingFile = useCallback(() => {
    setEditingFile(null);
  }, []);

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
    if (!selectedChannel || (currentMessage.trim() === '' && !pendingFile)) {
      console.log('handleSendMessage - Message empty or no channel selected, or no pending file'); // Debug log
      return;
    }
    const newMessage: Message = {
      id: Date.now() as MessageId,
      authorId: currentUser.id,
      text: currentMessage,
      timestamp: new Date().toISOString(),
      ...(replyingToMessage && { repliedToMessageId: replyingToMessage.id }),
      ...(pendingFile && { file: { name: pendingFile.name, type: pendingFile.type, url: pendingFile.url || URL.createObjectURL(pendingFile.fileObject!) } }),
    };
    console.log('handleSendMessage - newMessage:', newMessage); // Debug log
    setMessages(prev => {
      const updatedMessages = { ...prev, [selectedChannel.id]: [...(prev[selectedChannel.id] || []), newMessage] };
      console.log('handleSendMessage - updatedMessages state:', updatedMessages); // Debug log
      return updatedMessages;
    });
    setCurrentMessage('');
    setReplyingToMessage(null);
    setPendingFile(null); // Clear pending file after sending
  }, [currentMessage, selectedChannel, currentUser.id, replyingToMessage, pendingFile, setMessages, setPendingFile]);
  
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const BLOCKED_EXTENSIONS = ['exe', 'msi', 'bat', 'sh'];

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && BLOCKED_EXTENSIONS.includes(fileExtension)) {
      toast.error(`Unsupported file type: .${fileExtension}`);
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size cannot exceed 5MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      setPendingFile({
        name: file.name,
        type: file.type,
        url: e.target?.result as string,
        fileObject: file, // Store the actual file object
      });
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      setPendingFile({
        name: file.name,
        type: file.type,
        url: '', // No URL for non-image files until sent/uploaded
        fileObject: file,
      });
    }
    event.target.value = ''; // Clear the file input
  }, [setPendingFile]);
  
  const handleStartEditMessage = useCallback((message: Message) => {
    if (message.authorId !== currentUser.id) {
      return;
    }
    setEditingMessageId(message.id);
    setEditedMessageText(message.text || '');
    setEditingFile(message.file || null);
  }, [currentUser.id]);
  
  const handleCancelEditMessage = useCallback(() => {
    setEditingMessageId(null);
    setEditedMessageText('');
    setEditingFile(null);
  }, []);

  const handleSaveEditMessage = useCallback(() => {
    if (editingMessageId === null || !selectedChannel) {
      return;
    }
    setMessages(prev => ({
      ...prev,
      [selectedChannel.id]: prev[selectedChannel.id].map(msg =>
        msg.id === editingMessageId ? { 
          ...msg, 
          text: editedMessageText,
          file: editingFile || undefined,
        } : msg
      ),
    }));
    setEditingMessageId(null);
    setEditedMessageText('');
    setEditingFile(null);
  }, [editingMessageId, selectedChannel, editedMessageText, editingFile, setMessages]);
  
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

  const handleRemovePendingFile = useCallback(() => {
    if (pendingFile?.url && pendingFile.fileObject) {
      URL.revokeObjectURL(pendingFile.url); // Clean up URL object
    }
    setPendingFile(null);
  }, [pendingFile, setPendingFile]);

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
    if (!currentThread || !selectedChannel || (replyText.trim() === '' && !pendingFile)) {
      return;
    }
    const newReply: Message = {
      id: Date.now() as MessageId,
      authorId: currentUser.id,
      timestamp: new Date().toISOString(),
      ...(replyingToMessage && { repliedToMessageId: replyingToMessage.id }),
      text: replyText,
      ...(pendingFile && { file: { name: pendingFile.name, type: pendingFile.type, url: pendingFile.url || URL.createObjectURL(pendingFile.fileObject!) } }),
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
    setPendingFile(null); // Clear pending file after sending
  }, [threadStack, selectedChannel, currentUser.id, messages, replyingToMessage, pendingFile, setMessages, setPendingFile]);
  
  const handleFileUploadInThread = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const BLOCKED_EXTENSIONS = ['exe', 'msi', 'bat', 'sh'];

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && BLOCKED_EXTENSIONS.includes(fileExtension)) {
        toast.error(`Unsupported file type: .${fileExtension}`);
        event.target.value = '';
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        toast.error('File size cannot exceed 5MB.');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      setPendingFile({
        name: file.name,
        type: file.type,
        url: e.target?.result as string,
        fileObject: file, // Store the actual file object
      });
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      setPendingFile({
        name: file.name,
        type: file.type,
        url: '', // No URL for non-image files until sent/uploaded
        fileObject: file,
      });
    }
    event.target.value = ''; // Clear the file input
  }, [setPendingFile]);

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
    setEditingFile(message.file || null);
  }, [currentUser.id]);

  const handleSaveEditMessageInThread = useCallback((messageIdToSave: MessageId) => {
    const currentThread = threadStack[threadStack.length - 1];
    if (!currentThread || !selectedChannel || editingMessageId === null) {
      return;
    }

    const updateFn = (messageToUpdate: Message) => ({
      ...messageToUpdate,
      thread: (messageToUpdate.thread || []).map(msg =>
        msg.id === messageIdToSave ? { 
          ...msg, 
          text: editedMessageText,
          file: editingFile || undefined,
        } : msg
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
    setEditingFile(null);
  }, [threadStack, selectedChannel, editingMessageId, editedMessageText, editingFile, setMessages]);

  return {
    users, setUsers,
    threadStack,
    dmChannels, setDmChannels,
    selectedDmChannel, setSelectedDmChannel,
    currentMessage, setCurrentMessage,
    messagesEndRef,
    fileInputRef,
    editFileInputRef,
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
    pendingFile,
    handleRemovePendingFile,
    editingFile,
    handleFileEditUpload,
    handleRemoveEditingFile,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    isPinnedMessagesOpen, setIsPinnedMessagesOpen,
    togglePinMessage,
  };
};
