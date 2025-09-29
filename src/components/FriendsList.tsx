'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';

export const FriendsList = React.memo(() => {
  const { users, handleDmChannelSelect } = useAppContext();

  // Convert users object to an array, excluding the current user
  const friends = Object.values(users).filter(user => user.id !== 1);

  return (
    <div className='w-64 bg-gray-800 text-gray-800 p-3 flex flex-col'>
      <div className='p-2 mb-2'>
        <h2 className='text-xl font-bold text-gray-100'>Friends</h2>
      </div>
      <div className='flex-1 overflow-y-auto'>
        <h3 className='text-xs font-bold uppercase text-gray-500 px-2 mb-2'>Online - {friends.length}</h3>
        <div className='space-y-1'>
          {friends.map(friend => (
            <div 
              key={friend.id} 
              className='flex items-center space-x-3 p-2 rounded-md hover:bg-gray-300 cursor-pointer'
              onClick={() => handleDmChannelSelect(friend.id)}
            >
              <div className='w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-700'>{friend.avatar}</div>
              <div>
                <span className='font-semibold text-gray-100'>{friend.name}</span>
                <p className='text-sm text-gray-500'>Status message placeholder</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

FriendsList.displayName = 'FriendsList';