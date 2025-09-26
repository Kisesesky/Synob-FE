import type { Server, User, Message } from './types';

export const INITIAL_SERVERS: Server[] = [
  {
    id: 1,
    name: 'Synology',
    icon: 'SY',
    categories: [
      { id: 1, name: '채팅', channels: [{ id: 1, name: '일반' }, { id: 2, name: '랜덤' }] },
      { id: 2, name: '개발', channels: [{ id: 3, name: '프론트엔드' }, { id: 4, name: '백엔드' }] },
    ],
  },
  {
    id: 2,
    name: 'Next.js',
    icon: 'N',
    categories: [
      { id: 3, name: 'Documentation', channels: [{ id: 5, name: 'getting-started' }, { id: 6, name: 'routing' }] },
    ],
  },
];

export const INITIAL_USERS: { [id: number]: User } = {
  1: { id: 1, name: 'Me', avatar: 'M' },
  2: { id: 2, name: 'Gemini', avatar: 'G' },
  3: { id: 3, name: 'Admin', avatar: 'A' },
  4: { id: 4, name: 'User1', avatar: 'U' },
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
    {id: 1, authorId: 2, text: '안녕하세요! Synology 서버의 채팅 채널에 오신 것을 환영합니다.', timestamp: getTimestamp(2, '10:00'), reactions: {'👍': [2, 3, 4]}},
    {id: 2, authorId: 1, text: '안녕하세요!', timestamp: getTimestamp(2, '10:01')},
    {id: 3, authorId: 1, text: '이 메시지는 스레드 테스트를 위한 원본 메시지입니다.', timestamp: getTimestamp(1, '10:05'),
      thread: [
        {id: 301, authorId: 2, text: '스레드 답글입니다.', timestamp: getTimestamp(1, '10:06')},
        {id: 302, authorId: 1, text: '네, 알겠습니다.', timestamp: getTimestamp(1, '10:07'), repliedToMessageId: 301},
      ]
    },
    {id: 4, authorId: 3, text: '오늘의 공지사항입니다.', timestamp: getTimestamp(0, '11:30')},
    {id: 5, authorId: 4, text: '점심 메뉴 추천해주세요!', timestamp: getTimestamp(0, '12:00')},
    {id: 6, authorId: 1, text: '저는 비빔밥이요!', timestamp: getTimestamp(0, '12:05'), repliedToMessageId: 5},
  ],
  2: [
    {id: 7, authorId: 3, text: '랜덤 채널에 오신 것을 환영합니다.', timestamp: getTimestamp(3, '09:00')},
    {id: 8, authorId: 1, text: '오늘 날씨 좋네요.', timestamp: getTimestamp(0, '13:00')},
  ],
  3: [
    {id: 9, authorId: 4, text: '프론트엔드 개발 관련 질문 있습니다.', timestamp: getTimestamp(1, '15:00')},
    {id: 10, authorId: 2, text: '어떤 질문이신가요?', timestamp: getTimestamp(1, '15:01')},
  ],
  4: [
    {id: 11, authorId: 1, text: '백엔드 서버 배포 완료했습니다.', timestamp: getTimestamp(0, '16:00')},
  ],
  5: [
    {id: 12, authorId: 2, text: 'Next.js 14 문서 업데이트 확인해주세요.', timestamp: getTimestamp(0, '09:00')},
  ],
  6: [
    {id: 13, authorId: 3, text: '라우팅 관련 질문은 여기에 해주세요.', timestamp: getTimestamp(0, '10:00')},
  ],
};