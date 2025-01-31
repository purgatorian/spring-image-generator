'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import ImageUpload from '@/components/ImageUpload';
import { buildClothingModePayload } from '@/lib/payloadBuilder';
import ZoomModal from '@/components/ZoomModal';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';

const STATIC_IMAGES = [
  'https://kicg90yzimfez6ec.public.blob.vercel-storage.com/blank-clothes/man-sweater-modal.jpg',
  'https://kicg90yzimfez6ec.public.blob.vercel-storage.com/blank-clothes/man-sweater.jpg',
  'https://kicg90yzimfez6ec.public.blob.vercel-storage.com/blank-clothes/woman-dress-black-model.jpg',
  'https://kicg90yzimfez6ec.public.blob.vercel-storage.com/blank-clothes/woman-dress-black.jpg',
  'https://kicg90yzimfez6ec.public.blob.vercel-storage.com/blank-clothes/woman-dress-model.jpg',
  'https://kicg90yzimfez6ec.public.blob.vercel-storage.com/blank-clothes/woman-dress.jpg',
  'https://kicg90yzimfez6ec.public.blob.vercel-storage.com/blank-clothes/woman-t-shirt-model.jpg',
  'https://kicg90yzimfez6ec.public.blob.vercel-storage.com/blank-clothes/woman-t-shirt.jpg',
];

const ImageGeneratePage = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStaticImage, setSelectedStaticImage] = useState<string | null>(
    null
  );
  const [segmentPrompt, setSegmentPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState('Waiting for generation...');
  const [progress, setProgress] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!taskId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/generate?task_id=${taskId}&apiMode=clothing`
        );
        const data = await res.json();
        if (data.status) {
          setStatus(data.status);
        }
        if (data.progress !== undefined) {
          setProgress(data.progress);
        }
        if (data.status === 'COMPLETED' && data.image_urls) {
          setGeneratedImages(data.image_urls);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error fetching task status:', error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [taskId]);

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
  }, [progress, displayedProgress]);

  const handleGenerate = async () => {
    if (!uploadedImage || !selectedStaticImage || !segmentPrompt.trim()) return;

    setStatus('Queuing generation...');
    setProgress(0);
    setDisplayedProgress(0);

    const payload = buildClothingModePayload(
      segmentPrompt,
      uploadedImage,
      selectedStaticImage
    );
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiMode: 'clothing', payload }),
      });
      if (!response.ok) {
        throw new Error('Failed to queue generation');
      }
      const data = await response.json();
      setTaskId(data.task_id);
      setStatus('Queued');
    } catch (error) {
      console.error('Error queuing task:', error);
    } finally {
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-8">
      {/* Image Upload and Static Selection Card */}
      <Card className="w-full p-4 md:p-6">
        <CardHeader>
          <CardTitle>Select Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            onUploadComplete={(url) => setUploadedImage(url)}
            onRemoveImage={() => setUploadedImage(null)}
          />
          <Separator className="my-4" />
          <div className="flex flex-col gap-4">
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
            >
              <CarouselContent>
                {STATIC_IMAGES.map((imageUrl, index) => (
                  <CarouselItem
                    key={index}
                    className="md:basis-1/3 lg:basis-1/4"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedStaticImage(imageUrl)}
                      className={`border-2 rounded p-1 ${selectedStaticImage === imageUrl ? 'border-blue-500' : 'border-transparent'}`}
                    >
                      <Image
                        src={imageUrl}
                        alt={`Static ${index + 1}`}
                        width={100}
                        height={100}
                        className="rounded"
                      />
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
          <Input
            type="text"
            placeholder="Enter segment prompt..."
            value={segmentPrompt}
            onChange={(e) => setSegmentPrompt(e.target.value)}
          />
          <Button
            onClick={handleGenerate}
            disabled={
              !uploadedImage || !selectedStaticImage || !segmentPrompt.trim()
            }
          >
            Generate
          </Button>
        </CardContent>
      </Card>

      {/* Generated Images Card with Skeleton and Progress */}
      <Card className="w-full p-4 md:p-6">
        <CardHeader>
          <CardTitle>Generated Images</CardTitle>
          {taskId && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">{status}</p>
              <Progress value={displayedProgress} className="w-full" />
              <p className="text-sm text-gray-600 text-right mt-1">
                {displayedProgress}%
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {taskId && generatedImages.length === 0 && (
            <Skeleton className="w-32 h-32 rounded" />
          )}
          {generatedImages.map((imageUrl, index) => (
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
          ))}
        </CardContent>
      </Card>
      {/* Zoom Modal */}
      {zoomModalOpen && (
        <ZoomModal
          images={generatedImages.map((url) => ({ url }))}
          currentIndex={activeImageIndex}
          onClose={() => setZoomModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ImageGeneratePage;
