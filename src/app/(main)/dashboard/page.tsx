'use client';

import { useState, useEffect } from 'react';
import { MainPage } from '@/components/MainPage';
import { useBackground } from '@/lib/useBackground';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { background } = useBackground();

  useEffect(() => {
    const body = document.body;
    body.classList.remove('custom-background');
    body.style.removeProperty('--custom-bg-url');
    const existingVideo = document.querySelector('.background-video');
    if (existingVideo) {
      existingVideo.remove();
    }

    // This part of the useEffect should only run if the user is logged in and on the dashboard.
    // The background logic is still relevant for the main application.
    if (background) {
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
    } else { // If no background is set, ensure default styling for logged in state
      body.style.backgroundColor = 'black';
      body.style.backgroundImage = 'none';
    }
  }, [background]);


  useEffect(() => {
    // Check if logged in. If not, redirect to login page.
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  if (isLoading) {
    return <div className='flex min-h-screen items-center justify-center text-white'>Loading...</div>;
  }

  return <MainPage onLogout={handleLogout} />;
}