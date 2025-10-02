'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import type { User } from '@/lib/types';
import Image from 'next/image'; // Import Image component

export const AddFriendDialog = () => {
  const { isAddFriendOpen, setIsAddFriendOpen, users, currentUser, sendFriendRequest } = useAppContext();
  const [username, setUsername] = useState('');
  const [searchResult, setSearchResult] = useState<User | null | 'not_found'> (null);

  const handleSearch = () => {
    if (username.trim() === '') return;
    const foundUser = Object.values(users).find(u => u.fullName.toLowerCase() === username.toLowerCase() || u.nickname?.toLowerCase() === username.toLowerCase());
    
    if (foundUser && foundUser.id !== currentUser?.id) { // Added null check for currentUser
      setSearchResult(foundUser);
    } else {
      setSearchResult('not_found');
    }
  };

  const handleSendRequest = () => {
    if (searchResult && searchResult !== 'not_found') {
      sendFriendRequest(searchResult.id);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsAddFriendOpen(false);
    setUsername('');
    setSearchResult(null);
  }

  return (
    <Dialog open={isAddFriendOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            Enter a username to send a friend request.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Input
              id="username"
              placeholder="Enter a username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white"
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
          {searchResult === 'not_found' && (
            <p className="text-red-500 text-sm">User not found.</p>
          )}
          {searchResult && searchResult !== 'not_found' && (
            <div className="flex items-center justify-between p-2 rounded-md bg-gray-100 dark:bg-gray-700">
              <div className="flex items-center">
                <div className='relative w-8 h-8 rounded-full overflow-hidden bg-gray-400 dark:bg-gray-600 flex-shrink-0'>
                  {searchResult.avatarUrl ? (
                    <Image src={searchResult.avatarUrl} alt="Avatar" layout="fill" objectFit="cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-white">
                      {searchResult.fullName[0]}
                    </div>
                  )}
                </div>
                <p className="ml-2 font-semibold">{searchResult.fullName} {searchResult.nickname ? `(${searchResult.nickname})` : ''}</p>
              </div>
              <Button onClick={handleSendRequest} size="sm">Send Request</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};