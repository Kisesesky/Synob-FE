import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Message } from '@/lib/types';
import { EMOJI_MAP } from './emojis'; // Import EMOJI_MAP from emojis.ts

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(timestamp: string): string {
  const messageDate = new Date(timestamp);
  const now = new Date();

  // Helper to get the start of the day in local timezone
  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const messageStartOfDay = startOfDay(messageDate);
  const nowStartOfDay = startOfDay(now);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStartOfDay = startOfDay(yesterday);

  const isToday = messageStartOfDay.getTime() === nowStartOfDay.getTime();
  const isYesterday = messageStartOfDay.getTime() === yesterdayStartOfDay.getTime();

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

  // Helper to get the start of the day in local timezone
  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  messages.forEach(message => {
    const messageDate = new Date(message.timestamp);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const messageStartOfDay = startOfDay(messageDate);
    const nowStartOfDay = startOfDay(now);
    const yesterdayStartOfDay = startOfDay(yesterday);

    let dateString: string;
    if (messageStartOfDay.getTime() === nowStartOfDay.getTime()) {
      dateString = '오늘';
    } else if (messageStartOfDay.getTime() === yesterdayStartOfDay.getTime()) {
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

export function replaceEmojiShortcuts(text: string): string {
  let processedText = text;
  for (const shortcut in EMOJI_MAP) {
    if (EMOJI_MAP.hasOwnProperty(shortcut)) {
      const emoji = EMOJI_MAP[shortcut];
      // Use a regex to replace all occurrences of the shortcut
      processedText = processedText.replace(new RegExp(shortcut, 'g'), emoji);
    }
  }
  return processedText;
}

export function parseMarkdownToHtml(markdownText: string): string {
  let html = markdownText;

  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic: *text*
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Code: `code`
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  return html;
}
