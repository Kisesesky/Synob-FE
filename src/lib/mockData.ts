import type { Server, User, Message } from './types';
import type { ServerId, CategoryId, ChannelId, UserId, MessageId } from './brandedTypes';

export const INITIAL_SERVERS: Server[] = [
  {
    id: 1 as ServerId,
    name: 'Synology',
    icon: 'SY',
    imageUrl: '', // Placeholder image
    categories: [
      { id: 1 as CategoryId, name: '채팅', channels: [{ id: 1 as ChannelId, name: '일반', memberIds: [1 as UserId, 2 as UserId, 3 as UserId, 4 as UserId, 5 as UserId, 6 as UserId] }, { id: 2 as ChannelId, name: '랜덤', memberIds: [1 as UserId, 2 as UserId] }] },
      { id: 2 as CategoryId, name: '개발', channels: [{ id: 3 as ChannelId, name: '프론트엔드', memberIds: [1 as UserId, 4 as UserId] }, { id: 4 as ChannelId, name: '백엔드', memberIds: [2 as UserId, 3 as UserId] }] },
    ],
  },
  {
    id: 2 as ServerId,
    name: 'Next.js',
    icon: 'N',
    imageUrl: 'https://cdn.spotvnews.co.kr/news/photo/202405/681149_1047749_1528.jpg', // Placeholder image
    categories: [
      { id: 3 as CategoryId, name: 'Documentation', channels: [{ id: 5 as ChannelId, name: 'getting-started' }, { id: 6 as ChannelId, name: 'routing' }] },
    ],
  },
];

export const INITIAL_USERS: { [id: number]: User } = {
  1: { id: 1 as UserId, name: 'Me', avatar: 'M', status: 'Online', friendIds: [2 as UserId], incomingFriendRequests: [3 as UserId] },
  2: { id: 2 as UserId, name: 'Gemini', avatar: 'G', status: 'Working on a new feature', friendIds: [1 as UserId], incomingFriendRequests: [] },
  3: { id: 3 as UserId, name: 'Admin', avatar: 'A', status: 'In a meeting', friendIds: [], incomingFriendRequests: [] },
  4: { id: 4 as UserId, name: 'User1', avatar: 'U', status: 'Away', friendIds: [], incomingFriendRequests: [] },
  5: { id: 5 as UserId, name: 'User2', avatar: 'U', status: 'Away', friendIds: [], incomingFriendRequests: [] },
  6: { id: 6 as UserId, name: 'User3', avatar: 'U', status: 'Away', friendIds: [], incomingFriendRequests: [] },
};

export const INITIAL_MESSAGES: { [key: number]: Message[] } = {
  1: [
    {id: 1 as MessageId, authorId: 2 as UserId, text: '안녕하세요! Synology 서버의 채팅 채널에 오신 것을 환영합니다.', timestamp: '2025-09-27T10:00:00.000Z', reactions: {'👍': [2 as UserId, 3 as UserId, 4 as UserId]}, isPinned: true},
    {id: 2 as MessageId, authorId: 1 as UserId, text: '안녕하세요!', timestamp: '2025-09-27T10:01:00.000Z'},
    {id: 3 as MessageId, authorId: 1 as UserId, text: '이 메시지는 스레드 테스트를 위한 원본 메시지입니다.', timestamp: '2025-09-28T10:05:00.000Z',
      thread: [
        {id: 301 as MessageId, authorId: 2 as UserId, text: '스레드 답글입니다.', timestamp: '2025-09-28T10:06:00.000Z'},
        {id: 302 as MessageId, authorId: 1 as UserId, text: '네, 알겠습니다.', timestamp: '2025-09-28T10:07:00.000Z', repliedToMessageId: 301 as MessageId},
      ]
    },
    {id: 4 as MessageId, authorId: 3 as UserId, text: '오늘의 공지사항입니다.', timestamp: '2025-09-29T11:30:00.000Z', isPinned: true},
    {id: 5 as MessageId, authorId: 4 as UserId, text: '점심 메뉴 추천해주세요!', timestamp: '2025-09-29T12:00:00.000Z'},
    {id: 6 as MessageId, authorId: 1 as UserId, text: '저는 비빔밥이요!', timestamp: '2025-09-29T12:05:00.000Z', repliedToMessageId: 5 as MessageId},
  ],
  2: [
    {id: 7 as MessageId, authorId: 3 as UserId, text: '랜덤 채널에 오신 것을 환영합니다.', timestamp: '2025-09-26T09:00:00.000Z', isPinned: true},
    {id: 8 as MessageId, authorId: 1 as UserId, text: '오늘 날씨 좋네요.', timestamp: '2025-09-29T13:00:00.000Z'},
  ],
  3: [
    {id: 9 as MessageId, authorId: 4 as UserId, text: '프론트엔드 개발 관련 질문 있습니다.', timestamp: '2025-09-28T15:00:00.000Z'},
    {id: 10 as MessageId, authorId: 2 as UserId, text: '어떤 질문이신가요?', timestamp: '2025-09-28T15:01:00.000Z'},
  ],
  4: [
    {id: 11 as MessageId, authorId: 1 as UserId, text: '백엔드 서버 배포 완료했습니다.', timestamp: '2025-09-29T16:00:00.000Z'},
  ],
  5: [
    {id: 12 as MessageId, authorId: 2 as UserId, text: 'Next.js 14 문서 업데이트 확인해주세요.', timestamp: '2025-09-29T09:00:00.000Z', isPinned: true},
  ],
  6: [
    {id: 13 as MessageId, authorId: 3 as UserId, text: '라우팅 관련 질문은 여기에 해주세요.', timestamp: '2025-09-29T10:00:00.000Z'},
  ],
};