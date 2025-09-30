'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import type { User } from '@/lib/types';

export const AddFriendDialog = () => {
  const { isAddFriendOpen, setIsAddFriendOpen, users, currentUser, sendFriendRequest } = useAppContext();
  const [username, setUsername] = useState('');
  const [searchResult, setSearchResult] = useState<User | null | 'not_found'> (null);

  const handleSearch = () => {
    if (username.trim() === '') return;
    const foundUser = Object.values(users).find(u => u.name.toLowerCase() === username.toLowerCase());
    
    if (foundUser && foundUser.id !== currentUser.id) {
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
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
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
              className="bg-gray-700 border-gray-600"
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
          {searchResult === 'not_found' && (
            <p className="text-red-500 text-sm">User not found.</p>
          )}
          {searchResult && searchResult !== 'not_found' && (
            <div className="flex items-center justify-between p-2 rounded-md bg-gray-700">
              <div className="flex items-center">
                <div className='w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold flex-shrink-0'>{searchResult.avatar}</div>
                <p className="ml-2 font-semibold">{searchResult.name}</p>
              </div>
              <Button onClick={handleSendRequest} size="sm">Send Request</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};