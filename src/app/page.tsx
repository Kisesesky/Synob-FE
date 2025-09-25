'use client';

import { useState, useEffect } from 'react';
import { LockScreen } from '@/components/LockScreen';
import { MainPage } from '@/components/MainPage';
import { useBackground } from '@/lib/useBackground';

export default function AppEntry() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { background } = useBackground();

  useEffect(() => {
    const body = document.body;
    body.classList.remove('custom-background');
    body.style.removeProperty('--custom-bg-url');
    const existingVideo = document.querySelector('.background-video');
    if (existingVideo) existingVideo.remove();

    if (!isLoggedIn && background) {
      if (background.type === 'photo') {
        body.style.setProperty('--custom-bg-url', `url(${background.url})`);
        body.classList.add('custom-background');
      } else if (background.type === 'video') {
        const videoEl = document.createElement('video');
        videoEl.className = 'background-video';
        videoEl.autoplay = true;
        videoEl.muted = true;
        videoEl.loop = true;
        videoEl.playsInline = true;
        videoEl.src = background.url;
        document.body.appendChild(videoEl);

        const handleResize = () => {
          const isMobile = window.innerWidth < 768;
          if (isMobile) {
            videoEl.style.width = '100vw';
            videoEl.style.height = '100vh';
            videoEl.style.top = '0';
            videoEl.style.left = '0';
            videoEl.style.transform = 'none';
            videoEl.style.borderRadius = '0';
          } else {
            videoEl.style.width = '81vw';
            videoEl.style.height = '81vh';
            videoEl.style.top = '50%';
            videoEl.style.left = '50%';
            videoEl.style.transform = 'translate(-50%, -50%)';
            videoEl.style.borderRadius = '1.5rem';
            videoEl.style.overflow = 'hidden';
          }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }
    } else if (isLoggedIn) {
      body.style.backgroundColor = 'black';
      body.style.backgroundImage = 'none';
    }
  }, [isLoggedIn, background]);


  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>;
  }

  if (!isLoggedIn) {
    return <LockScreen onLogin={handleLogin} />;
  }

  return <MainPage onLogout={handleLogout} />;
}
