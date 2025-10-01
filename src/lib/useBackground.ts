import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

// Define the structure of a background object
export interface BackgroundSelection {
  id: number;
  type: 'video' | 'photo';
  url: string;
  thumbnail: string;
  photographer: string;
  alt: string;
}

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
  const { background: customBackground } = useTheme();
  const [background, setBackground] = useState<BackgroundSelection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (customBackground) {
      // Assuming customBackground is always a photo URL for now
      setBackground({
        id: 0,
        type: 'photo',
        url: customBackground,
        thumbnail: '',
        photographer: '',
        alt: 'Custom background'
      });
    } else {
      setBackground(DEFAULT_BACKGROUND);
    }
    setIsLoading(false);
  }, [customBackground]);

  return {
    background,
    isLoading,
  };
}
