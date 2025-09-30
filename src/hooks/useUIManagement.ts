import { useState } from 'react';

export const useUIManagement = () => {
  const [contextMenu, setContextMenu] = useState<{ type: string; id: string | number; x: number; y: number } | null>(null);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return {
    contextMenu, setContextMenu,
    isAddFriendOpen, setIsAddFriendOpen,
    isAnnouncementsOpen, setIsAnnouncementsOpen,
    isNotificationsOpen, setIsNotificationsOpen,
  };
};
