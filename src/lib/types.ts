export interface Channel {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  channels: Channel[];
}

export interface Server {
  id: number;
  name: string;
  icon: string;
  categories: Category[];
}

export interface User {
  id: number;
  name: string;
  avatar: string;
}

export interface Message {
  id: number;
  text?: string;
  authorId: number;
  timestamp: string;
  file?: { name: string; type: string; url: string; };
  reactions?: { [emoji: string]: number[] };
  thread?: Message[];
  channelId?: number;
  repliedToMessageId?: number;
}
