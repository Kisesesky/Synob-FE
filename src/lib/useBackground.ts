import { useState, useEffect } from 'react';

// Define the structure of a background object
export interface BackgroundSelection {
  id: number;
  type: 'video' | 'photo';
  url: string;
  thumbnail: string;
  photographer: string;
  alt: string;
}

const GUEST_STORAGE_KEY = 'contentful-clock-background';

// Default video background
const DEFAULT_BACKGROUND: BackgroundSelection = {
  id: 1,
  type: 'video',
  url: 'https://videos.pexels.com/video-files/8820216/8820216-hd_1920_1080_25fps.mp4',
  thumbnail: 'https://images.pexels.com/videos/8820216/pexels-photo-8820216.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
  photographer: 'Pexels',
  alt: 'Default video background'
};

export function useBackground() {
  const [background, setBackground] = useState<BackgroundSelection | null>(DEFAULT_BACKGROUND);
  const [isLoading, setIsLoading] = useState(true);

  // Load background from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      if (stored) {
        setBackground(JSON.parse(stored));
      } else {
        setBackground(DEFAULT_BACKGROUND);
      }
    } catch (error) {
      console.error('Error loading background from localStorage:', error);
      setBackground(DEFAULT_BACKGROUND);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    background,
    isLoading,
  };
}
