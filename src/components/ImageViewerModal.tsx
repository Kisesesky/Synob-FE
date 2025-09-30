import React, { useState } from 'react'; // Import useState
import Image from 'next/image';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle // Removed DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, X } from 'lucide-react'; // Removed X, added ZoomIn/Out

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
  const [zoomLevel, setZoomLevel] = useState(1.0); // New state for zoom

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] w-full max-h-[calc(100vh-100px)] p-0 bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col"> {/* Slightly smaller max-w, more vertical padding, less shadow */}
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 
          bg-neutral-900/10 backdrop-blur-sm border-b border-neutral-800 flex-shrink-0"> {/* Less padding, more subtle background/border */}
          <DialogTitle className="text-white text-md font-medium truncate">
            {fileName}
          </DialogTitle>
          
          <div className="flex items-center space-x-2"> {/* Smaller space-x */}
            <Button
              variant="ghost"
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))}
              className="text-gray-400 hover:text-white hover:bg-neutral-800 px-3 py-2" // Smaller padding
            >
              <ZoomIn className="h-8 w-8" /> {/* Smaller icons */}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
              className="text-gray-400 hover:text-white hover:bg-neutral-800 px-3 py-2" // Smaller padding
            >
              <ZoomOut className="h-8 w-8" /> {/* Smaller icons */}
            </Button>
            <Button
              variant="ghost"
              onClick={handleDownload}
              className="text-gray-400 hover:text-white hover:bg-neutral-800 px-3 py-2" // Smaller padding
            >
              <Download className="h-8 w-8" /> {/* Smaller icons */}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-300 hover:text-white hover:bg-neutral-800 px-3 py-2 rounded-lg"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>

        {/* Image Area */}
        <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b bg-neutral-900 overflow-auto relative"> {/* Less padding */}
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={src}
              alt={alt}
              width={400}
              height={600}
              className="object-contain"
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.25s ease-in-out'
              }}
            />
          </div>
          {/* Zoom controls - moved to header */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
