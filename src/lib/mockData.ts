import type { Server, User, Message } from './types';
import type { ServerId, CategoryId, ChannelId, UserId, MessageId } from './brandedTypes';

export const INITIAL_SERVERS: Server[] = [
  {
    id: 1 as ServerId,
    name: 'Synology',
    icon: 'SY',
    categories: [
      { id: 1 as CategoryId, name: '채팅', channels: [{ id: 1 as ChannelId, name: '일반' }, { id: 2 as ChannelId, name: '랜덤' }] },
      { id: 2 as CategoryId, name: '개발', channels: [{ id: 3 as ChannelId, name: '프론트엔드' }, { id: 4 as ChannelId, name: '백엔드' }] },
    ],
  },
  {
    id: 2 as ServerId,
    name: 'Next.js',
    icon: 'N',
    categories: [
      { id: 3 as CategoryId, name: 'Documentation', channels: [{ id: 5 as ChannelId, name: 'getting-started' }, { id: 6 as ChannelId, name: 'routing' }] },
    ],
  },
];

export const INITIAL_USERS: { [id: number]: User } = {
  1: { id: 1 as UserId, name: 'Me', avatar: 'M' },
  2: { id: 2 as UserId, name: 'Gemini', avatar: 'G' },
  3: { id: 3 as UserId, name: 'Admin', avatar: 'A' },
  4: { id: 4 as UserId, name: 'User1', avatar: 'U' },
};

// Helper to get a date string for today, yesterday, and older
const getTimestamp = (daysAgo: number, time: string) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${time}`;
};

export const INITIAL_MESSAGES: { [key: number]: Message[] } = {
  1: [
    {id: 1 as MessageId, authorId: 2 as UserId, text: '안녕하세요! Synology 서버의 채팅 채널에 오신 것을 환영합니다.', timestamp: getTimestamp(2, '10:00'), reactions: {'👍': [2 as UserId, 3 as UserId, 4 as UserId]}},
    {id: 2 as MessageId, authorId: 1 as UserId, text: '안녕하세요!', timestamp: getTimestamp(2, '10:01')},
    {id: 3 as MessageId, authorId: 1 as UserId, text: '이 메시지는 스레드 테스트를 위한 원본 메시지입니다.', timestamp: getTimestamp(1, '10:05'),
      thread: [
        {id: 301 as MessageId, authorId: 2 as UserId, text: '스레드 답글입니다.', timestamp: getTimestamp(1, '10:06')},
        {id: 302 as MessageId, authorId: 1 as UserId, text: '네, 알겠습니다.', timestamp: getTimestamp(1, '10:07'), repliedToMessageId: 301 as MessageId},
      ]
    },
    {id: 4 as MessageId, authorId: 3 as UserId, text: '오늘의 공지사항입니다.', timestamp: getTimestamp(0, '11:30')},
    {id: 5 as MessageId, authorId: 4 as UserId, text: '점심 메뉴 추천해주세요!', timestamp: getTimestamp(0, '12:00')},
    {id: 6 as MessageId, authorId: 1 as UserId, text: '저는 비빔밥이요!', timestamp: getTimestamp(0, '12:05'), repliedToMessageId: 5 as MessageId},
  ],
  2: [
    {id: 7 as MessageId, authorId: 3 as UserId, text: '랜덤 채널에 오신 것을 환영합니다.', timestamp: getTimestamp(3, '09:00')},
    {id: 8 as MessageId, authorId: 1 as UserId, text: '오늘 날씨 좋네요.', timestamp: getTimestamp(0, '13:00')},
  ],
  3: [
    {id: 9 as MessageId, authorId: 4 as UserId, text: '프론트엔드 개발 관련 질문 있습니다.', timestamp: getTimestamp(1, '15:00')},
    {id: 10 as MessageId, authorId: 2 as UserId, text: '어떤 질문이신가요?', timestamp: getTimestamp(1, '15:01')},
  ],
  4: [
    {id: 11 as MessageId, authorId: 1 as UserId, text: '백엔드 서버 배포 완료했습니다.', timestamp: getTimestamp(0, '16:00')},
  ],
  5: [
    {id: 12 as MessageId, authorId: 2 as UserId, text: 'Next.js 14 문서 업데이트 확인해주세요.', timestamp: getTimestamp(0, '09:00')},
  ],
  6: [
    {id: 13 as MessageId, authorId: 3 as UserId, text: '라우팅 관련 질문은 여기에 해주세요.', timestamp: getTimestamp(0, '10:00')},
  ],
};