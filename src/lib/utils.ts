import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Message } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(timestamp: string): string {
  const messageDate = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isToday = messageDate.toDateString() === now.toDateString();
  const isYesterday = messageDate.toDateString() === yesterday.toDateString();

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Use AM/PM
  };

  if (isToday) {
    return messageDate.toLocaleTimeString('ko-KR', timeOptions); // e.g., "오전 11:30"
  } else if (isYesterday) {
    return `어제 ${messageDate.toLocaleTimeString('ko-KR', timeOptions)}`; // e.g., "어제 오전 11:30"
  } else {
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    const formattedDate = messageDate.toLocaleDateString('ko-KR', dateOptions);
    const formattedTime = messageDate.toLocaleTimeString('ko-KR', timeOptions);
    return `${formattedDate} ${formattedTime}`;
  }
}

interface DateHeader {
  type: 'dateHeader';
  date: string;
  id: string; // Unique ID for key prop
}

type GroupedMessageItem = Message | DateHeader;

export function groupMessagesByDate(messages: Message[]): GroupedMessageItem[] {
  const grouped: GroupedMessageItem[] = [];
  let lastDate: string | null = null;

  messages.forEach(message => {
    const messageDate = new Date(message.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let dateString: string;
    if (messageDate.toDateString() === today.toDateString()) {
      dateString = '오늘';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      dateString = '어제';
    } else {
      dateString = messageDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    if (dateString !== lastDate) {
      grouped.push({ type: 'dateHeader', date: dateString, id: `date-${messageDate.getTime()}` });
      lastDate = dateString;
    }
    grouped.push(message);
  });

  return grouped;
}
