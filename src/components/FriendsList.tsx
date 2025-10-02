import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserId } from '@/lib/brandedTypes';
import Image from 'next/image'; // Import Image component

export const FriendsList = React.memo(() => {
  const { users, currentUser, handleDmChannelSelect, acceptFriendRequest, declineFriendRequest, setIsAddFriendOpen, removeFriend } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [friendContextMenu, setFriendContextMenu] = useState<{ id: UserId; x: number; y: number } | null>(null);

  // Ensure currentUser is not null before proceeding
  if (!currentUser) {
    return <div className="p-3">사용자 정보를 불러오는 중...</div>;
  }

  const friends = (currentUser.friendIds || []).map(id => users[id]).filter(Boolean);
  const pendingRequests = (currentUser.incomingFriendRequests || []).map(id => users[id]).filter(Boolean);

  const filteredFriends = friends.filter(user => 
    (user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) || (user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className='w-72 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 flex flex-col'>
      <div className='p-3 border-b border-gray-200 dark:border-gray-900'>
        <h2 className='text-lg font-bold text-black dark:text-white'>Friends</h2>
        <div className="mt-2">
            <Button onClick={() => setIsAddFriendOpen(true)} className="w-full bg-green-600 hover:bg-green-700 text-white">Add Friend</Button>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-3 space-y-6'>
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div>
            <h3 className='text-xs font-bold uppercase text-gray-700 dark:text-gray-400 px-1 mb-2'>Pending - {pendingRequests.length}</h3>
            <div className='space-y-2'>
              {pendingRequests.map(user => (
                <div key={user.id} className='flex items-center justify-between p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700'>
                  <div className="flex items-center">
                    <div className='relative w-8 h-8 rounded-full overflow-hidden bg-gray-400 dark:bg-gray-600 flex-shrink-0'>
                      {user.avatarUrl ? (
                        <Image src={user.avatarUrl} alt="Avatar" layout="fill" objectFit="cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-white">
                          {user.fullName[0]}
                        </div>
                      )}
                    </div>
                    <div className="ml-2">
                      <p className="font-semibold text-black dark:text-white">{user.fullName} {user.nickname ? `(${user.nickname})` : ''}</p>
                      <p className="text-xs text-gray-700 dark:text-gray-400">Incoming Friend Request</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button onClick={() => acceptFriendRequest(user.id)} variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:bg-gray-200 dark:hover:bg-gray-600"><Check /></Button>
                    <Button onClick={() => declineFriendRequest(user.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-gray-200 dark:hover:bg-gray-600"><X /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Friends */}
        <div>
          <h3 className='text-xs font-bold uppercase text-gray-700 dark:text-gray-400 px-1 mb-2'>All Friends - {filteredFriends.length}</h3>
          <div className='space-y-1'>
            {filteredFriends.map(friend => (
              <React.Fragment key={friend.id}>
                <div 
                  className='flex items-center space-x-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer'
                  onClick={() => handleDmChannelSelect(friend.id)}
                  onContextMenu={(e) => { e.preventDefault(); setFriendContextMenu({ id: friend.id, x: e.clientX, y: e.clientY }); }}
                >
                  <div className='relative w-8 h-8 rounded-full overflow-hidden bg-gray-400 dark:bg-gray-600 flex-shrink-0'>
                    {friend.avatarUrl ? (
                      <Image src={friend.avatarUrl} alt="Avatar" layout="fill" objectFit="cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-white">
                        {friend.fullName[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className='font-semibold text-black dark:text-white'>{friend.fullName} {friend.nickname ? `(${friend.nickname})` : ''}</span>
                    <p className='text-sm text-gray-700 dark:text-gray-400'>{friend.status || ''}</p>
                  </div>
                </div>
                {friendContextMenu?.id === friend.id && (
                  <DropdownMenu open={true} onOpenChange={(isOpen) => !isOpen && setFriendContextMenu(null)}>
                    <DropdownMenuContent 
                      className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-black dark:text-white'
                      style={{ position: 'fixed', top: friendContextMenu.y, left: friendContextMenu.x }}
                      onCloseAutoFocus={(e) => e.preventDefault()} // Prevent focus from returning to the trigger
                    >
                      <DropdownMenuItem onClick={() => removeFriend(friend.id)} className="text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Remove</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

FriendsList.displayName = 'FriendsList';