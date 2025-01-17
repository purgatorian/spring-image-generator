// app/components/GeneratePrint.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import ZoomModal from "@/components/ZoomModal";
import ImageUploadSection from "@/components/ImageUpload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Lock, LockOpen } from "lucide-react";
import {
  buildTextModePayload,
  buildImageModePayload
} from "@/lib/payloadBuilder";


export const GeneratePrint = () => {
  const [batchSkeletons, setBatchSkeletons] = useState<string[]>([]);
  const [mode, setMode] = useState<"text" | "image">("text");
  const [parameters, setParameters] = useState({
    resolution: "1024x1024",
    batchSize: 1,
    denoise: 1,
    tiling: true,
    resolutionLocked: true,
  });
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [status, setStatus] = useState("Waiting for generation...");
  const [runId, setRunId] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  // Smooth progress bar update
  useEffect(() => {
    if (progress === 100) {
      setDisplayedProgress(100);
      return;
    }
    if (displayedProgress < progress) {
      const difference = progress - displayedProgress;
      const increment = Math.max(1, Math.ceil(difference / 10));
      const delay = Math.max(50, 500 - difference * 5); // Faster when far, slower when close
      const timeout = setTimeout(() => {
        setDisplayedProgress((prev) => Math.min(prev + increment, progress));
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [progress, displayedProgress]);
  // 1. Poll the server for status if we have a runId
  useEffect(() => {
    if (!runId) return;
    const intervalId = setInterval(async () => {
      try {
        // Query our own route:
        const res = await fetch(`/api/generate?task_id=${runId}&apiMode=${mode}`);
        if (!res.ok) {
          throw new Error("Failed to fetch task status");
        }
        const data = await res.json();

        if (data.error) {
          console.error("Error from server route:", data.error);
          setStatus(`Error: ${data.error}`);
          clearInterval(intervalId);
          return;
        }

        // Update progress, status, images, etc.
        setProgress(data.progress);
        setStatus(data.status);

        // If completed, show the images immediately
        if (data.status === "COMPLETED") {
          setIsGenerating(false);

          if (data.image_urls?.length) {
            setGeneratedImages(data.image_urls);
          }
          setStatus("Completed");
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error("Polling error:", err);
        setStatus("Error checking status");
        clearInterval(intervalId);
      }
    }, 5000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [runId, mode]);

// 2. Handle Generate
const handleGenerate = async () => {
  setIsGenerating(true);
  setGeneratedImages([]);
  setProgress(0);
  setDisplayedProgress(0);
  setBatchSkeletons(Array.from({ length: parameters.batchSize }));
  setStatus("Queuing generation...");

  let payload;

  if (mode === "text") {
    payload = buildTextModePayload(prompt.trim(), negativePrompt.trim(), parameters);
  } else if (mode === "image" && uploadedImageUrl) {
    payload = buildImageModePayload(uploadedImageUrl, parameters);
  }

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiMode: mode, payload }),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      console.error("❌ Detailed Error Response:", errorDetails);
      throw new Error(`Failed to queue generation: ${errorDetails.error || res.statusText}`);
    }

    const { task_id } = await res.json();
    setRunId(task_id);
    setStatus("Queued");
  } catch (error: unknown) {
    console.error("❌ Error in handleGenerate:", error);
    if (error instanceof Error) {
      setStatus(`Error while queuing generation: ${error.message}`);
    } else {
      setStatus("An unknown error occurred while queuing generation.");
    }
  } finally {

  }
};


  // 3. UI
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
              checked={mode === "image"}
              onCheckedChange={(checked) => setMode(checked ? "image" : "text")}
            />
            <span className="text-sm md:text-base">Image</span>
          </div>

          {/* Input Section */}
          {mode === "text" ? (
            <>
              <Textarea
                placeholder="Describe in detail..."
                rows={4}
                className="w-full"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Textarea
                placeholder="Negative prompts (optional)..."
                rows={3}
                className="w-full"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
              />
            </>
          ) : (
            <ImageUploadSection onUploadComplete={(url) => setUploadedImageUrl(url)} />
          )}

          {/* Generate & Advanced Params */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  Advanced Parameters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full md:w-[350px] space-y-4 p-4">
                {/* Advanced Form */}
                <div className="space-y-4">
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
                        className={`p-2 rounded ${
                          parameters.resolutionLocked
                            ? "bg-blue-200 dark:bg-blue-700"
                            : "hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
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
                        value={parameters.resolution.split("x")[0]}
                        className="w-full"
                        onChange={(e) =>
                          setParameters((prev) => ({
                            ...prev,
                            resolution: parameters.resolutionLocked
                              ? `${e.target.value}x${e.target.value}`
                              : `${e.target.value}x${prev.resolution.split("x")[1]}`,
                          }))
                        }
                      />
                      <span className="text-center text-gray-500 font-medium">X</span>
                      <Input
                        type="number"
                        placeholder="Height"
                        value={parameters.resolution.split("x")[1]}
                        className="w-full"
                        onChange={(e) =>
                          setParameters((prev) => ({
                            ...prev,
                            resolution: parameters.resolutionLocked
                              ? `${e.target.value}x${e.target.value}`
                              : `${prev.resolution.split("x")[0]}x${e.target.value}`,
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
                          batchSize: parseInt(e.target.value, 10),
                        }))
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Denoise */}
                  <div className="flex items-center justify-between">
                    <label>Denoise:</label>
                    <Slider
                      value={[parameters.denoise * 100]}
                      max={100}
                      step={1}
                      onValueChange={(value) =>
                        setParameters((prev) => ({
                          ...prev,
                          denoise: value[0] / 100,
                        }))
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Tiling */}
                  <div className="flex items-center gap-2">
                    <label>Enable Tiling</label>
                    <Checkbox
                      checked={parameters.tiling}
                      onCheckedChange={(checked) =>
                        setParameters((prev) => ({ ...prev, tiling: checked === true }))
                      }
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              onClick={handleGenerate}
              className="h-12 w-full md:w-auto flex items-center justify-center"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card className="w-full xl:w-1/2 p-4 md:p-6 space-y-4">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Generated Images</CardTitle>

          {runId && (
            <div className="w-full mt-2">
              <p className="text-sm text-gray-600 mb-1">{status}</p>
              <Progress value={displayedProgress} className="w-full transition-all duration-1500 ease-out" />
              <p className="text-sm text-gray-600 text-right mt-1">{displayedProgress.toFixed(0)}%</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 justify-center">
          {runId && generatedImages.length === 0 &&
            batchSkeletons.map((_, index) => (
              <Skeleton key={index} className="w-32 h-32 rounded" />
            ))
          }

          {generatedImages.map((imageUrl, index) => (
            <div
              key={index}
              className="relative cursor-pointer"
              style={{ width: "100%", maxWidth: "200px", aspectRatio: "1 / 1" }}
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
