import React, { useState } from 'react'; // Import useState
import Image from 'next/image';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle // Removed DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, X, RotateCcw, RotateCw } from 'lucide-react';

interface ImageViewerModalProps {
  src: string;
  alt: string;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  src, alt, fileName, isOpen, onClose
}) => {
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [rotation, setRotation] = useState(0);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    onClose();
    // Reset state on close
    setTimeout(() => {
        setZoomLevel(1.0);
        setRotation(0);
    }, 200); // Delay to match animation
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[700px] w-full max-h-[calc(100vh-80px)] p-0 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-2xl flex flex-col dark:bg-slate-900 dark:border-slate-700">
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
          <DialogTitle className="text-slate-900 text-md font-medium truncate dark:text-slate-100">
            {fileName}
          </DialogTitle>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              onClick={() => setRotation(prev => prev - 90)}
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setRotation(prev => prev + 90)}
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
            >
              <RotateCw className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))}
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={handleDownload}
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Image Area */}
        <div className="flex-1 flex items-center justify-center p-8 bg-slate-200/50 overflow-auto relative dark:bg-slate-900/50">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={src}
              alt={alt}
              width={400}
              height={600}
              className="object-contain"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-in-out'
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
