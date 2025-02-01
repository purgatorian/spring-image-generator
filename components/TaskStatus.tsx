import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import ZoomModal from '@/components/ZoomModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TaskStatusProps {
  status: string;
  progress: number;
  generatedImages: string[];
  error?: string | null;
}

const TaskStatus: React.FC<TaskStatusProps> = ({
  status,
  progress,
  generatedImages,
  error,
}) => {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Smooth progress bar animation with dynamic updates
  useEffect(() => {
    if (progress === 100) {
      setDisplayedProgress(100);
      return;
    }

    if (displayedProgress < progress) {
      const difference = progress - displayedProgress;
      const increment = Math.max(1, Math.ceil(difference / 10));
      const delay = Math.max(50, 500 - difference * 5);

      const timeout = setTimeout(() => {
        setDisplayedProgress((prev) => Math.min(prev + increment, progress));
      }, delay);

      return () => clearTimeout(timeout);
    }

    if (progress < 95) {
      const slowIncrease = setInterval(() => {
        setDisplayedProgress((prev) => Math.min(prev + 1, progress));
      }, 1500);

      return () => clearInterval(slowIncrease);
    }
  }, [progress, displayedProgress]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generated Images</CardTitle>
        {status === 'Generation failed' && (
          <Alert variant="destructive" className="mt-2">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Something went wrong. Please contact support.
            </AlertDescription>
          </Alert>
        )}
        <p className="text-sm text-gray-600 mb-1">{status}</p>
        <Progress
          value={displayedProgress}
          className="w-full transition-all duration-1500 ease-out"
        />
        <p className="text-sm text-gray-600 text-right mt-1">
          {displayedProgress}%
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        {generatedImages.length === 0 && !error ? (
          <p>No images generated yet.</p>
        ) : (
          generatedImages.map((imageUrl, index) => (
            <div
              key={index}
              className="relative cursor-pointer"
              style={{ width: '100%', maxWidth: '200px', aspectRatio: '1 / 1' }}
              onClick={() => {
                setZoomModalOpen(true);
                setActiveImageIndex(index);
              }}
            >
              <Image
                src={imageUrl}
                alt={`Generated ${index + 1}`}
                width={200}
                height={200}
                className="rounded object-contain"
              />
            </div>
          ))
        )}
      </CardContent>

      {zoomModalOpen && (
        <ZoomModal
          images={generatedImages.map((url) => ({ url }))}
          currentIndex={activeImageIndex}
          onClose={() => setZoomModalOpen(false)}
        />
      )}
    </Card>
  );
};

export default TaskStatus;
