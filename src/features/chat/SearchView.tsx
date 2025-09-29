'use client';

import React, { useEffect } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { MessageItem } from './MessageItem';
import { Message } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { groupMessagesByDate } from '../../lib/utils'; // Import groupMessagesByDate

interface DateHeader {
  type: 'dateHeader';
  date: string;
  id: string;
}

type GroupedMessageItem = Message | DateHeader;

export const SearchView = () => {
  const {
    isSearching,
    searchResults,
    searchQuery,
    setSearchQuery,
    handleSearch,
    setIsSearching, // To close the search panel
    selectedChannel,
    selectedDmChannel,
    viewMode,
    messages, // messages for all channels
    searchSenderId, setSearchSenderId,
    searchStartDate, setSearchStartDate,
    searchEndDate, setSearchEndDate,
    searchChannelId, setSearchChannelId,
    excludeMyMessages, setExcludeMyMessages,
    onlyMyMessages, setOnlyMyMessages,
    hasMoreSearchResults,
    loadMoreSearchResults,
    users,
    selectedServer,
  } = useAppContext();

  useEffect(() => {
    // Trigger a search when the search view opens or filters change
    if (isSearching) {
      handleSearch();
    }
  }, [isSearching, searchSenderId, searchStartDate, searchEndDate, searchChannelId, excludeMyMessages, onlyMyMessages, handleSearch]);

  if (!isSearching) {
    return null;
  }

  const activeChannel = viewMode === 'friends' ? selectedDmChannel : selectedChannel;
  const currentChannelMessages: Message[] = activeChannel ? messages[activeChannel.id] || [] : [];

  const groupedSearchResults = groupMessagesByDate(searchResults);

  const handleCloseSearch = () => {
    setIsSearching(false);
    setSearchQuery('');
    setSearchSenderId(null);
    setSearchStartDate(null);
    setSearchEndDate(null);
    setSearchChannelId(null);
    setExcludeMyMessages(false);
    setOnlyMyMessages(false);
  };

  return (
    <div className='h-full bg-gray-900 border-l border-gray-700 flex flex-col z-10'>
      <div className='p-3 border-b border-gray-700 flex justify-between items-center'>
        <div className='flex items-center'>
          <Search size={20} className='text-white mr-2'/>
          <h3 className='font-bold text-white'>Search</h3>
        </div>
        <button onClick={handleCloseSearch}>
          <X size={20} className='text-white'/>
        </button>
      </div>
      
      <div className='p-2 border-b border-gray-900 shadow-md flex items-center'>
        <input
          type='text'
          placeholder='Search messages...'
          className='flex-1 bg-gray-800 border-gray-600 text-white rounded-md px-3 py-1 focus:outline-none'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      <div className='p-4 space-y-4 border-b border-gray-800'>
        {/* Sender Filter */}
        <div>
          <Label htmlFor='sender-select' className='text-gray-400 text-sm'>From:</Label>
          <select
            id='sender-select'
            className='w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-1 mt-1 focus:outline-none'
            value={searchSenderId || ''}
            onChange={(e) => setSearchSenderId(e.target.value ? Number(e.target.value) as import('@/lib/brandedTypes').UserId : null)}
          >
            <option value=''>Any sender</option>
            {Object.values(users).map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <Label className='text-gray-400 text-sm'>During:</Label>
          <div className='flex space-x-2 mt-1'>
            <Input
              type='date'
              className='flex-1 bg-gray-800 border-gray-600 text-white rounded-md px-3 py-1 focus:outline-none'
              value={searchStartDate || ''}
              onChange={(e) => setSearchStartDate(e.target.value)}
            />
            <span className='text-gray-400 flex items-center'>to</span>
            <Input
              type='date'
              className='flex-1 bg-gray-800 border-gray-600 text-white rounded-md px-3 py-1 focus:outline-none'
              value={searchEndDate || ''}
              onChange={(e) => setSearchEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Channel Filter */}
        <div>
          <Label htmlFor='channel-select' className='text-gray-400 text-sm'>In channel:</Label>
          <select
            id='channel-select'
            className='w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-1 mt-1 focus:outline-none'
            value={searchChannelId || ''}
            onChange={(e) => setSearchChannelId(e.target.value ? Number(e.target.value) as import('@/lib/brandedTypes').ChannelId : null)}
          >
            <option value=''>Any channel</option>
            {selectedServer?.categories.map(category => (
              category.channels.map(channel => (
                <option key={channel.id} value={channel.id}>#{channel.name}</option>
              ))
            ))}
          </select>
        </div>

        {/* Checkboxes */}
        <div className='flex flex-col space-y-2'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='exclude-my-messages'
              checked={excludeMyMessages}
              onCheckedChange={(checked) => setExcludeMyMessages(checked === true)}
              className='border-gray-600'
            />
            <Label htmlFor='exclude-my-messages' className='text-gray-300'>Exclude my messages</Label>
          </div>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='only-my-messages'
              checked={onlyMyMessages}
              onCheckedChange={(checked) => setOnlyMyMessages(checked === true)}
              className='border-gray-600'
            />
            <Label htmlFor='only-my-messages' className='text-gray-300'>Only my messages</Label>
          </div>
        </div>
        <Button onClick={() => handleSearch()} className='w-full bg-blue-600 hover:bg-blue-700 text-white'>Apply Filters</Button>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-0'>
        {groupedSearchResults.length > 0 ? (
          groupedSearchResults.map((item, index) => {
            if ('type' in item && item.type === 'dateHeader') {
              return (
                <div key={item.id} className='relative flex justify-center items-center my-4'>
                  <div className='flex-grow border-t border-gray-700'></div>
                  <span className='flex-shrink mx-4 text-sm text-gray-400'>{item.date}</span>
                  <div className='flex-grow border-t border-gray-700'></div>
                </div>
              );
            } else {
              const msg = item as Message;
              // Find the previous actual message, skipping date headers
              let prevMsg: Message | null = null;
              for (let i = index - 1; i >= 0; i--) {
                const prevItem = groupedSearchResults[i];
                if (!('type' in prevItem && prevItem.type === 'dateHeader')) {
                  prevMsg = prevItem as Message;
                  break;
                }
              }
              return (
                <MessageItem
                  key={msg.id}
                  msg={msg}
                  prevMsg={prevMsg}
                  isSearchResult={true}
                  allChannelMessages={currentChannelMessages}
                />
              );
            }
          })
        ) : (
          <div className='text-center text-gray-400'>No results found for &quot;{searchQuery}&quot;</div>
        )}
        {hasMoreSearchResults && (
          <div className='flex justify-center mt-4'>
            <Button onClick={loadMoreSearchResults} className='bg-gray-700 hover:bg-gray-600 text-white'>Load More</Button>
          </div>
        )}
      </div>
    </div>
  );
};
