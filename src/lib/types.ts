import type { ServerId, ChannelId, CategoryId, UserId, MessageId } from './brandedTypes';

export interface Channel {
  id: ChannelId;
  name: string;
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
  categories: Category[];
}

export interface User {
  id: UserId;
  name: string;
  avatar: string;
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
}
