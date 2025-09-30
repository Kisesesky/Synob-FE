import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserId } from '@/lib/brandedTypes';

export const FriendsList = React.memo(() => {
  const { users, currentUser, handleDmChannelSelect, acceptFriendRequest, declineFriendRequest, setIsAddFriendOpen, removeFriend } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [friendContextMenu, setFriendContextMenu] = useState<{ id: UserId; x: number; y: number } | null>(null);

  const friends = (currentUser.friendIds || []).map(id => users[id]).filter(Boolean);
  const pendingRequests = (currentUser.incomingFriendRequests || []).map(id => users[id]).filter(Boolean);

  const filteredFriends = friends.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='w-72 bg-gray-800 text-gray-300 flex flex-col'>
      <div className='p-3 border-b border-gray-900'>
        <h2 className='text-lg font-bold text-white'>Friends</h2>
        <div className="mt-2">
            <Button onClick={() => setIsAddFriendOpen(true)} className="w-full bg-green-600 hover:bg-green-700 text-white">Add Friend</Button>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-3 space-y-6'>
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div>
            <h3 className='text-xs font-bold uppercase text-gray-400 px-1 mb-2'>Pending - {pendingRequests.length}</h3>
            <div className='space-y-2'>
              {pendingRequests.map(user => (
                <div key={user.id} className='flex items-center justify-between p-2 rounded-md hover:bg-gray-700'>
                  <div className="flex items-center">
                    <div className='w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold flex-shrink-0'>{user.avatar}</div>
                    <div className="ml-2">
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">Incoming Friend Request</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button onClick={() => acceptFriendRequest(user.id)} variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:bg-gray-600"><Check /></Button>
                    <Button onClick={() => declineFriendRequest(user.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-gray-600"><X /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Friends */}
        <div>
          <h3 className='text-xs font-bold uppercase text-gray-400 px-1 mb-2'>All Friends - {filteredFriends.length}</h3>
          <div className='space-y-1'>
            {filteredFriends.map(friend => (
              <React.Fragment key={friend.id}>
                <div 
                  className='flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 cursor-pointer'
                  onClick={() => handleDmChannelSelect(friend.id)}
                  onContextMenu={(e) => { e.preventDefault(); setFriendContextMenu({ id: friend.id, x: e.clientX, y: e.clientY }); }}
                >
                  <div className='w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold flex-shrink-0'>{friend.avatar}</div>
                  <div>
                    <span className='font-semibold text-white'>{friend.name}</span>
                    <p className='text-sm text-gray-400'>{friend.status || ''}</p>
                  </div>
                </div>
                {friendContextMenu?.id === friend.id && (
                  <DropdownMenu open={true} onOpenChange={(isOpen) => !isOpen && setFriendContextMenu(null)}>
                    <DropdownMenuContent 
                      className='bg-gray-800 border-gray-700 text-white'
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