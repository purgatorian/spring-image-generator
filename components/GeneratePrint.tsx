'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import ImageUploadSection from '@/components/ImageUpload';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Lock, LockOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTaskProcessor } from '@/hooks/useTaskProcessor';
import TaskStatus from '@/components/TaskStatus';
import { buildTextModePayload } from '@/lib/payloadBuilder';

export const GeneratePrint = () => {
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState(
    'Low-quality details, blurry textures, pixelated patterns, distorted shapes, overexposed colors, harsh gradients, excessive noise, artifacts, unintended objects, incomplete designs, asymmetry in patterns (unless intentional), clashing colors, low contrast, uneven spacing, unrealistic elements, unrelated background objects, unwanted shadows, misaligned repetitions, overcomplicated designs, poor composition, random text, logos, watermarks, or borders.'
  );
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [parameters, setParameters] = useState({
    resolution: '1024x1024',
    batchSize: 1,
    tiling: false,
    resolutionLocked: true,
  });

  const { toast } = useToast();
  const { generatedImages, progress, status, isGenerating, startTask } =
    useTaskProcessor();

  const examplePrompts = [
    'A mesmerizing deep midnight blue sky, scattered with countless shimmering stars, glowing nebula clouds, and a subtle gradient of twilight hues. The design has a dreamy and cosmic aesthetic, perfect for elegant and celestial-themed clothing prints, ultra high-definition, intricate details, seamless tiling, high contrast, no noise, no artifacts.',
    'A vibrant and lively summer-themed pattern with tropical palm leaves, radiant sunrays, colorful exotic flowers, and a clear blue ocean backdrop. The design is dynamic, full of warmth and positive energy, perfect for beachwear or summer clothing prints. Ultra high-resolution, vivid color contrast, seamless tiling, sharp details, no artifacts.',
    'An elegant and artistic floral pattern featuring hand-painted watercolor roses, peonies, and delicate wildflowers. Soft pastel hues blend into a dreamy, aesthetic composition with smooth brush strokes and naturalistic gradients. Designed for a stylish and timeless clothing print, ultra high-definition, seamless pattern, rich details, no artifacts, no harsh shadows.',
  ];
  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };
  // Fetch print description for uploaded image
  const fetchPrintDescription = useCallback(
    async (imageUrl: string) => {
      if (!prompt) {
        try {
          toast({
            title: 'Fetching description...',
            description: 'Analyzing image...',
            variant: 'default',
          });
          const response = await fetch('/api/describe-print', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl }),
          });

          if (!response.ok) throw new Error('Failed to fetch description');
          const { description } = await response.json();
          setPrompt(description);
          toast({
            title: 'Success',
            description: 'Description fetched successfully!',
            variant: 'default',
          });
        } catch (error) {
          toast({
            title: 'Error',
            description:
              error instanceof Error ? error.message : 'Unknown error',
            variant: 'destructive',
          });
        }
      }
    },
    [prompt, toast]
  );

  useEffect(() => {
    if (uploadedImageUrl) {
      fetchPrintDescription(uploadedImageUrl);
    }
  }, [uploadedImageUrl, fetchPrintDescription]);

  const handleGenerate = () => {
    if (mode === 'text' && !prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a prompt.',
        variant: 'destructive',
      });
      return;
    }

    if (mode === 'image' && !uploadedImageUrl) {
      toast({
        title: 'Error',
        description: 'Please upload an image.',
        variant: 'destructive',
      });
      return;
    }

    const payload = buildTextModePayload(
      prompt.trim(),
      negativePrompt.trim(),
      parameters
    );
    startTask(mode, payload);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-8">
      {/* Main Card */}
      <Card className="w-full lg:w-3/4 p-4 md:p-6 space-y-6">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Generate Print</CardTitle>
          <CardDescription className="text-sm md:text-lg">
            Generate high-quality print images with advanced customization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Switch */}
          <div className="flex items-center space-x-2">
            <span className="text-sm md:text-base">Text</span>
            <Switch
              checked={mode === 'image'}
              onCheckedChange={(checked) => setMode(checked ? 'image' : 'text')}
            />
            <span className="text-sm md:text-base">Image</span>
          </div>

          {/* Input Section */}
          {mode === 'text' ? (
            <>
              {/* Positive Prompt Section */}
              <div className="space-y-3 p-4 border rounded-lg">
                <p className="text-lg font-semibold">Positive Prompt</p>
                <div className="flex space-x-2">
                  {examplePrompts.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExampleClick(example)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
                <Textarea
                  placeholder="Describe in detail..."
                  rows={5}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* Negative Prompt Section */}
              <div className="space-y-3 p-4 border rounded-lg">
                <p className="text-lg font-semibold">Negative Prompt</p>
                <Textarea
                  placeholder="Negative prompts (optional)..."
                  rows={5}
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                />
              </div>
            </>
          ) : (
            <ImageUploadSection
              onUploadComplete={setUploadedImageUrl}
              onRemoveImage={() => setUploadedImageUrl(null)}
            />
          )}

          {/* Advanced Parameters */}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                Advanced Parameters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full md:w-[350px] space-y-4 p-4">
              {/* Resolution */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium">Resolution:</label>
                  <button
                    onClick={() =>
                      setParameters((prev) => ({
                        ...prev,
                        resolutionLocked: !prev.resolutionLocked,
                      }))
                    }
                    className="p-2 rounded"
                  >
                    {parameters.resolutionLocked ? (
                      <Lock className="w-5 h-5 text-blue-500" />
                    ) : (
                      <LockOpen className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Width"
                    value={parameters.resolution.split('x')[0]}
                    onChange={(e) =>
                      setParameters((prev) => ({
                        ...prev,
                        resolution: `${e.target.value}x${prev.resolution.split('x')[1]}`,
                      }))
                    }
                  />
                  <span className="text-center text-gray-500 font-medium">
                    X
                  </span>
                  <Input
                    type="number"
                    placeholder="Height"
                    value={parameters.resolution.split('x')[1]}
                    onChange={(e) =>
                      setParameters((prev) => ({
                        ...prev,
                        resolution: `${prev.resolution.split('x')[0]}x${e.target.value}`,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Batch Size */}
              <div className="flex items-center justify-between">
                <label>Batch Size:</label>
                <Input
                  type="number"
                  min="1"
                  value={parameters.batchSize}
                  onChange={(e) =>
                    setParameters((prev) => ({
                      ...prev,
                      batchSize: Number(e.target.value) || 1,
                    }))
                  }
                />
              </div>

              {/* Tiling */}
              <div className="flex items-center gap-2">
                <label>Enable Tiling</label>
                <Checkbox
                  checked={parameters.tiling}
                  onCheckedChange={(checked) =>
                    setParameters((prev) => ({
                      ...prev,
                      tiling: checked === true,
                    }))
                  }
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Generate Button */}
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </CardContent>
      </Card>

      {/* Results & Progress */}
      <TaskStatus
        status={status}
        progress={progress}
        generatedImages={generatedImages}
      />
    </div>
  );
};
