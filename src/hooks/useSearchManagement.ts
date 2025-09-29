
import { useState, useCallback } from 'react';
import type { Message, Server, User } from '@/lib/types';
import type { UserId, ChannelId } from '@/lib/brandedTypes';

export const useSearchManagement = (
    selectedServer: Server,
    messages: { [key: number]: Message[] },
    currentUser: User,
    isSearching: boolean,
    setIsSearching: React.Dispatch<React.SetStateAction<boolean>>,
    searchQuery: string,
) => {
    const [searchSenderId, setSearchSenderId] = useState<UserId | null>(null);
    const [searchStartDate, setSearchStartDate] = useState<string | null>(null);
    const [searchEndDate, setSearchEndDate] = useState<string | null>(null);
    const [searchChannelId, setSearchChannelId] = useState<ChannelId | null>(null);
    const [excludeMyMessages, setExcludeMyMessages] = useState<boolean>(false);
    const [onlyMyMessages, setOnlyMyMessages] = useState<boolean>(false);
    const [searchOffset, setSearchOffset] = useState<number>(0);
    const [searchLimit] = useState<number>(20);
    const [hasMoreSearchResults, setHasMoreSearchResults] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<Message[]>([]);

    const handleSearch = useCallback((append: boolean = false) => {
        if (searchQuery.trim() === '' && !searchSenderId && !searchStartDate && !searchEndDate && !searchChannelId && !excludeMyMessages && !onlyMyMessages) {
          setIsSearching(false);
          setSearchResults([]);
          setHasMoreSearchResults(false);
          return;
        }
        setIsSearching(true);
        const allFilteredResults: Message[] = [];
        selectedServer.categories.forEach(category => {
          category.channels.forEach(channel => {
            const channelMessages = messages[channel.id] || [];
            channelMessages.forEach(msg => {
              let match = true;
              if (searchQuery.trim() !== '' && !msg.text?.toLowerCase().includes(searchQuery.toLowerCase())) match = false;
              if (searchSenderId !== null && msg.authorId !== searchSenderId) match = false;
              if (searchStartDate || searchEndDate) {
                const messageDate = new Date(msg.timestamp).setHours(0, 0, 0, 0);
                if (searchStartDate) {
                  const start = new Date(searchStartDate).setHours(0, 0, 0, 0);
                  if (messageDate < start) match = false;
                }
                if (searchEndDate) {
                  const end = new Date(searchEndDate).setHours(23, 59, 59, 999);
                  if (messageDate > end) match = false;
                }
              }
              if (searchChannelId !== null && msg.channelId !== searchChannelId) match = false;
              if (excludeMyMessages && msg.authorId === currentUser.id) match = false;
              if (onlyMyMessages && msg.authorId !== currentUser.id) match = false;
              if (match) {
                allFilteredResults.push({ ...msg, channelId: channel.id });
              }
            });
          });
        });
        allFilteredResults.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const currentOffset = append ? searchOffset : 0;
        const newOffset = currentOffset + searchLimit;
        const paginatedResults = allFilteredResults.slice(0, newOffset);
        setSearchResults(paginatedResults);
        setSearchOffset(newOffset);
        setHasMoreSearchResults(newOffset < allFilteredResults.length);
        if (!append) {
          setSearchOffset(searchLimit);
        }
      }, [searchQuery, searchSenderId, searchStartDate, searchEndDate, searchChannelId, excludeMyMessages, onlyMyMessages, selectedServer, messages, currentUser.id, searchLimit, searchOffset, setIsSearching]);
    
      const loadMoreSearchResults = useCallback(() => {
        handleSearch(true);
      }, [handleSearch]);

    return {
        searchSenderId, setSearchSenderId,
        searchStartDate, setSearchStartDate,
        searchEndDate, setSearchEndDate,
        searchChannelId, setSearchChannelId,
        excludeMyMessages, setExcludeMyMessages,
        onlyMyMessages, setOnlyMyMessages,
        searchOffset, setSearchOffset,
        searchLimit,
        hasMoreSearchResults, setHasMoreSearchResults,
        searchResults,
        handleSearch,
        loadMoreSearchResults,
    };
};
