import type { ServerId, ChannelId, CategoryId, UserId, MessageId } from './brandedTypes';

export interface Channel {
  id: ChannelId;
  name: string;
  memberIds?: UserId[];
}

export interface Category {
  id: CategoryId;
  name: string;
  channels: Channel[];
}

export interface Server {
  id: ServerId;
  name: string;
  icon: string;
  imageUrl?: string; // Optional image URL for the server icon
  categories: Category[];
}

export interface User {
  id: UserId;
  name: string;
  avatar: string;
  status?: string;
  friendIds?: UserId[];
  incomingFriendRequests?: UserId[];
}

export interface Message {
  id: MessageId;
  text?: string;
  authorId: UserId;
  timestamp: string;
  file?: { name: string; type: string; url: string; };
  reactions?: { [emoji: string]: UserId[] };
  thread?: Message[];
  channelId?: ChannelId;
  repliedToMessageId?: MessageId;
  isPinned?: boolean;
}
