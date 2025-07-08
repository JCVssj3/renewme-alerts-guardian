import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  documentName: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  imageUrl,
  documentName
}) => {
  const [zoom, setZoom] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  React.useEffect(() => {
    if (!isOpen) {
      resetView();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-card-bg border-primary-accent/20">
        <DialogHeader>
          <DialogTitle className="text-text-primary">{documentName}</DialogTitle>
        </DialogHeader>
        
        <div className="relative flex-1 overflow-hidden rounded-lg bg-black/5">
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomIn}
              className="bg-card-bg/90 backdrop-blur-sm"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomOut}
              className="bg-card-bg/90 backdrop-blur-sm"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetView}
              className="bg-card-bg/90 backdrop-blur-sm"
            >
              Reset
            </Button>
          </div>
          
          <div 
            className="w-full h-96 flex items-center justify-center overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={imageUrl}
              alt={documentName}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
              draggable={false}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;