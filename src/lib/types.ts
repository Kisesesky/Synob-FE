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
  fullName: string; // 이름
  nickname?: string; // 별명
  email?: string;
  phoneNumber?: string;
  avatarUrl: string; // 아바타 사진
  backgroundImage?: string; // 배경 사진
  status?: string; // 상태
  aboutMe?: string; // 소개글
  lockScreenPassword?: string; // 잠금화면 비밀번호 (해싱 필요)
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
