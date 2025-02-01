'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/components/ImageUpload';
import { buildClothingModePayload } from '@/lib/payloadBuilder';
import TaskStatus from '@/components/TaskStatus';
import { useTaskProcessor } from '@/hooks/useTaskProcessor';
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

  const { generatedImages, progress, status, isGenerating, startTask } =
    useTaskProcessor();

  const handleGenerate = () => {
    if (!uploadedImage || !selectedStaticImage || !segmentPrompt.trim()) return;

    const payload = buildClothingModePayload(
      segmentPrompt,
      uploadedImage,
      selectedStaticImage
    );
    startTask('clothing', payload);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-8">
      {/* Image Upload and Static Selection Card */}
      <Card className="w-full p-4 md:p-6">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">
            Generate Clothing
          </CardTitle>
          <CardDescription className="text-sm md:text-lg">
            Apply print designs to clothing images or to models with ease.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            onUploadComplete={setUploadedImage}
            onRemoveImage={() => setUploadedImage(null)}
          />
          <Separator className="my-4" />
          <div className="relative">
            <Carousel
              opts={{ align: 'start', loop: true }}
              className="relative"
            >
              <CarouselContent>
                {STATIC_IMAGES.map((imageUrl, index) => (
                  <CarouselItem
                    key={index}
                    className="basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/4"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedStaticImage(imageUrl)}
                      className={`border-2 rounded p-1 ${
                        selectedStaticImage === imageUrl
                          ? 'border-blue-500'
                          : 'border-transparent'
                      }`}
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
              {/* Position navigation buttons inside */}
              <CarouselPrevious className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full shadow" />
              <CarouselNext className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10  p-2 rounded-full shadow" />
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
              isGenerating ||
              !uploadedImage ||
              !selectedStaticImage ||
              !segmentPrompt.trim()
            }
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Images & Progress */}
      <TaskStatus
        status={status}
        progress={progress}
        generatedImages={generatedImages}
      />
    </div>
  );
};

export default ImageGeneratePage;
