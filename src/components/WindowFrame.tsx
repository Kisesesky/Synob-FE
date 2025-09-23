'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Minus, Square, X, Maximize2, Minimize2 } from 'lucide-react'; // Icons for controls

interface WindowFrameProps {
  children: React.ReactNode;
  title?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export function WindowFrame({ children, title = "Application", onClose, onMinimize, onMaximize }: WindowFrameProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Calculate initial center position
  const initialWidth = window.innerWidth * 0.8;
  const initialHeight = window.innerHeight * 0.8;
  const initialX = (window.innerWidth - initialWidth) / 2;
  const initialY = (window.innerHeight - initialHeight) / 2;

  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });

  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Detect mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Example breakpoint for mobile
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClose = () => {
    if (onClose) onClose();
    console.log("Close button clicked");
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (onMinimize) onMinimize();
    console.log("Minimize button clicked");
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (onMaximize) onMaximize();
    console.log("Maximize button clicked");
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

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !windowRef.current || isMaximized || isMinimized || isMobile) return;

    let newX = e.clientX - offset.x;
    let newY = e.clientY - offset.y;

    // Get current window dimensions
    const windowWidth = windowRef.current.offsetWidth;
    const windowHeight = windowRef.current.offsetHeight;

    // Clamp X position
    newX = Math.max(0, newX);
    newX = Math.min(newX, window.innerWidth - windowWidth);

    // Clamp Y position
    newY = Math.max(0, newY);
    newY = Math.min(newY, window.innerHeight - windowHeight);

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Initial centering and size
  useEffect(() => {
    if (windowRef.current && !isMaximized && !isMinimized && !isMobile) {
      const initialWidth = window.innerWidth * 0.8;
      const initialHeight = window.innerHeight * 0.8;
      const initialX = (window.innerWidth - initialWidth) / 2;
      const initialY = (window.innerHeight - initialHeight) / 2;

      setPosition({ x: initialX, y: initialY });
      setSize({ width: initialWidth, height: initialHeight });
    }
  }, [isMaximized, isMinimized, isMobile]);


  return (
    <Card 
      ref={windowRef}
      className={`fixed bg-background border border-border shadow-lg flex flex-col overflow-hidden transition-all duration-300 ease-in-out
        ${
          isMobile || isMaximized ? 'w-screen h-screen rounded-none top-0 left-0' : 'rounded-lg'
        }
        ${
          isMinimized ? 'bottom-0 left-0 h-12 w-64' : ''
        }
      `}
      style={isMaximized || isMinimized || isMobile ? {} : { top: `${position.y}px`, left: `${position.x}px`, width: `${size.width}px`, height: `${size.height}px` }}
      onClick={isMinimized ? handleMinimize : undefined} // Restore on click if minimized
    >
      {/* Title Bar */}
      <div 
        className={`flex items-center justify-between bg-muted text-muted-foreground p-2 border-b border-border flex-shrink-0
          ${
            isMobile ? '' : 'cursor-grab'
          }
        `}
        onMouseDown={isMobile ? undefined : handleMouseDown}
      >
        <span className="text-sm font-medium">{title}</span>
        {!isMobile && ( // Hide controls on mobile
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleMinimize} title={isMinimized ? "Restore" : "Minimize"}>
              {isMinimized ? <Minimize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleMaximize} title={isMaximized ? "Restore" : "Maximize"}>
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-500/20" onClick={handleClose} title="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Menu Bar (Placeholder) */}
      <div className={`flex items-center bg-background border-b border-border text-sm text-muted-foreground flex-shrink-0 ${isMinimized || isMobile ? 'hidden' : ''}`}>
        <Button variant="ghost" size="sm">File</Button>
        <Button variant="ghost" size="sm">Edit</Button>
        <Button variant="ghost" size="sm">View</Button>
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-auto ${isMinimized ? 'hidden' : ''}`}>
        {children}
      </div>
    </Card>
  );
}
