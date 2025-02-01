'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import ImageUpload from '@/components/ImageUpload';
import TaskStatus from '@/components/TaskStatus';
import { useTaskProcessor } from '@/hooks/useTaskProcessor';
import {
  buildUpscaleImagePayload,
  buildFixImagePayload,
} from '@/lib/payloadBuilder';

export default function FixImagePage() {
  const [selectedUpscale, setSelectedUpscale] = useState<number>(2); // ✅ Default to 2x
  const [upscaleImage, setUpscaleImage] = useState<string | null>(null);
  const [fixImage, setFixImage] = useState<string | null>(null);
  const blankImage =
    'https://kicg90yzimfez6ec.public.blob.vercel-storage.com/uploads/blank.png';
  const { generatedImages, progress, status, isGenerating, startTask, error } =
    useTaskProcessor();

  const handleUpscale = () => {
    if (!selectedUpscale || !upscaleImage) return;
    const payload = buildUpscaleImagePayload(upscaleImage, selectedUpscale);
    startTask('upscale', payload);
  };

  const handleFixImage = () => {
    if (!fixImage) return;
    const payload = buildFixImagePayload(blankImage, fixImage); // ✅ Use Fix Image Payload
    startTask('fix', payload);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-6xl">
      {/* Image Processing Card */}
      <Card className="w-full lg:w-1/2 min-w-[50%] max-w-[600px]">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">
            Fix and Enhance Images
          </CardTitle>
          <CardDescription className="text-sm md:text-lg">
            Upscale images for better resolution or fix lighting and background
            issues effortlessly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upscale">
            <TabsList className="mb-4">
              <TabsTrigger value="upscale">Upscale</TabsTrigger>
              <TabsTrigger value="fix">Fix Image</TabsTrigger>
            </TabsList>

            {/* Upscale Tab */}
            <TabsContent value="upscale">
              <div className="space-y-4">
                <ToggleGroup
                  type="single"
                  value={selectedUpscale}
                  onValueChange={setSelectedUpscale}
                >
                  {[2, 4, 5].map((factor) => (
                    <ToggleGroupItem key={factor} value={factor}>
                      {factor}x
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>

                <ImageUpload onUploadComplete={setUpscaleImage} />

                <Button
                  onClick={handleUpscale}
                  disabled={isGenerating || !selectedUpscale || !upscaleImage}
                >
                  {isGenerating ? 'Processing...' : 'Upscale'}
                </Button>
              </div>
            </TabsContent>

            {/* Fix Image Tab */}
            <TabsContent value="fix">
              <div className="space-y-4">
                <ImageUpload onUploadComplete={setFixImage} />

                <Button
                  onClick={handleFixImage}
                  disabled={isGenerating || !fixImage}
                >
                  {isGenerating ? 'Processing...' : 'Fix Image'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Task Status Card (Progress + Results) */}
      <TaskStatus
        status={status}
        progress={progress}
        generatedImages={generatedImages}
        error={error}
      />
    </div>
  );
}
