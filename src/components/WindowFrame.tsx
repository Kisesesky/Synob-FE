'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Minus, X, Maximize2, Minimize2 } from 'lucide-react';

interface WindowFrameProps {
  children: React.ReactNode;
  title?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export function WindowFrame({ children, title = 'Application', onClose, onMinimize, onMaximize }: WindowFrameProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 800, height: 600 }); // 기본값
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined' && !isMobile) {
      const initialWidth = window.innerWidth * 0.8;
      const initialHeight = (window.innerHeight - 90) * 0.8 * 1.20;
      const initialX = (window.innerWidth - initialWidth) / 2;
      const initialY = (window.innerHeight - initialHeight - 76) / 2; // Adjust initialY to account for dock and keep centered

      setPosition({ x: initialX, y: initialY });
      setSize({ width: initialWidth, height: initialHeight });
    }
  }, [isMobile]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClose = () => {
    onClose?.();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    onMinimize?.();
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    onMaximize?.();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current && !isMaximized && !isMinimized && !isMobile) {
      setIsDragging(true);
      setOffset({
        x: e.clientX - windowRef.current.getBoundingClientRect().left,
        y: e.clientY - windowRef.current.getBoundingClientRect().top,
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !windowRef.current || isMaximized || isMinimized || isMobile) {
      return;
    }

    let newX = e.clientX - offset.x;
    let newY = e.clientY - offset.y;

    const windowWidth = windowRef.current.offsetWidth;
    const windowHeight = windowRef.current.offsetHeight;

    newX = Math.max(0, Math.min(newX, window.innerWidth - windowWidth));
    newY = Math.max(0, Math.min(newY, window.innerHeight - windowHeight));

    setPosition({ x: newX, y: newY });
  }, [isDragging, isMaximized, isMinimized, isMobile, offset]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove]);

  return (
    <Card 
      ref={windowRef}
      className={`fixed bg-background border border-border shadow-lg flex flex-col overflow-hidden transition-all duration-300 ease-in-out
        ${ isMobile || isMaximized ? 'w-screen h-[calc(100vh-76px)] rounded-none top-0 left-0' : 'rounded-lg' }
        ${ isMinimized ? 'bottom-0 left-0 h-12 w-64 cursor-pointer' : '' }
      `}      style={isMaximized || isMinimized || isMobile ? {} : { top: `${position.y}px`, left: `${position.x}px`, width: `${size.width}px`, height: `${size.height}px` }}
      onDoubleClick={isMinimized ? handleMinimize : undefined}
    >
      {/* Title Bar */}
      <div 
        className={`flex items-center justify-between bg-muted text-muted-foreground p-2 border-b border-border flex-shrink-0
          ${ isMobile ? '' : 'cursor-grab' }
        `}
        onMouseDown={isMobile ? undefined : handleMouseDown}
      >
        <span className='text-sm font-medium'>{title}</span>
        {!isMobile && (
          <div className='flex space-x-1'>
            <Button variant='ghost' size='icon' className='h-6 w-6' onClick={handleMinimize} title={isMinimized ? 'Restore' : 'Minimize'}>
              {isMinimized ? <Minimize2 className='h-4 w-4' /> : <Minus className='h-4 w-4' />}
            </Button>
            <Button variant='ghost' size='icon' className='h-6 w-6' onClick={handleMaximize} title={isMaximized ? 'Restore' : 'Maximize'}>
              {isMaximized ? <Minimize2 className='h-4 w-4' /> : <Maximize2 className='h-4 w-4' />}
            </Button>
            <Button variant='ghost' size='icon' className='h-6 w-6 text-red-500 hover:bg-red-500/20' onClick={handleClose} title='Close'>
              <X className='h-4 w-4' />
            </Button>
          </div>
        )}
      </div>

      {/* Menu Bar (Placeholder) */}
      <div className={`flex items-center bg-background border-b border-border text-sm text-muted-foreground flex-shrink-0 ${isMinimized || isMobile ? 'hidden' : ''}`}>
        <Button variant='ghost' size='sm'>File</Button>
        <Button variant='ghost' size='sm'>Edit</Button>
        <Button variant='ghost' size='sm'>View</Button>
        <Button variant='ghost' size='sm'>Settings</Button>
      </div>

      {/* Content Area */}
      <div className={`flex flex-col flex-1 overflow-hidden ${isMinimized ? 'hidden' : ''}`}>
        {children}
      </div>
    </Card>
  );
}
