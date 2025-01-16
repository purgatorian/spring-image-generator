//app/components/GeneratePrint.tsx
"use client";
import * as React from "react";
import { useState } from "react";
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
import { buildTextModePayload } from "@/lib/payloadBuilder";
import { useTaskStatus } from "@/app/api/hooks/useTaskStatus";
import { Lock, LockOpen} from "lucide-react";
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
import ImageUploadSection from "@/components/ImageUpload";

export const GeneratePrint = () => {
  const [batchSkeletons, setBatchSkeletons] = useState([]);
  const [mode, setMode] = useState("text");
  const [parameters, setParameters] = useState({
    resolution: "1024x1024",
    batchSize: 1,
    denoise: 1,
    tiling: true,
    resolutionLocked: true,
  });
  const [generatedImages, setGeneratedImages] = useState([]);
  const [status, setStatus] = useState("Waiting for generation...");
  const [runId, setRunId] = useState(null); // Run ID for polling
  const [progress, setProgress] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0); // Default to the first image
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");


  // Modified handleGenerate function to use Picallow
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedImages([]);
    setProgress(0);
    setBatchSkeletons(Array.from({ length: parameters.batchSize }));
  
    let payload;
  
    if (mode === "text") {
      // ✅ Build the payload and log it
      const builtPayload = buildTextModePayload(prompt.trim(), negativePrompt.trim(), parameters);  
      payload = {
        apiEndpoint: "https://api.instasd.com/api_endpoints/ma5o39at1e9gnd",
        payload: builtPayload,
      };
    } else if (mode === "image" && uploadedImageUrl) {
      payload = {
        apiEndpoint: "https://api.instasd.com/api_endpoints/your_image_endpoint",
        payload: {
          mode: "image",
          uploadedImage: uploadedImageUrl,
          ...parameters,
          tiling: parameters.tiling ? "enable" : "disable",
        },
      };
    }
  
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("❌ Detailed Error Response:", errorDetails);
        throw new Error(`Failed to queue generation: ${errorDetails.error || response.statusText}`);
      }
  
      const { task_id } = await response.json();
      setRunId(task_id);
      setStatus("Queued");
    } catch (error) {
      console.error("❌ Error in handleGenerate:", error);
      setStatus(`Error while queuing generation: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };  

  useTaskStatus({
    taskId: runId,
    apiEndpoint: "https://api.instasd.com/api_endpoints/ma5o39at1e9gnd",
    onProgressUpdate: (progress) => setProgress(progress),
    onComplete: (imageUrls) => {
      setIsGenerating(false);
      setGeneratedImages(imageUrls);
      setStatus("Completed");
    },
    onError: (error) => setStatus(error),
  });  

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
            <div className="space-y-4">
              <Textarea
                placeholder="Describe in detail what the print should look like..."
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
            </div>
          ) : (
            <div className="space-y-6">   
          <ImageUploadSection />
            </div>
          )}

          {/* Generate Button and Advanced Parameters */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  Advanced Parameters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full md:w-[350px] space-y-4 p-4">
                {/* Advanced Parameters Form */}
                <div className="space-y-4">
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
                              : `${e.target.value}x${
                                  prev.resolution.split("x")[1]
                                }`,
                          }))
                        }
                      />
                      <span className="text-center text-gray-500 font-medium">
                        X
                      </span>
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
                              : `${prev.resolution.split("x")[0]}x${
                                  e.target.value
                                }`,
                          }))
                        }
                      />
                    </div>
                  </div>
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
                  <div className="flex items-center justify-items-start gap-2">
                    <label>Enable Tiling</label>

                    <Checkbox
                      checked={parameters.tiling}
                      onCheckedChange={(checked) =>
                        setParameters((prev) => ({ ...prev, tiling: checked }))
                      }
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              onClick={handleGenerate}
              className="h-12 w-full md:w-auto flex items-center justify-center"
              disabled={isGenerating} // Disable while loading
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

      {/* Generated Images Card */}
      {/* Generated Images Card */}
      <Card className="w-full lg:w-1/4 p-4 space-y-4">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Generated Images</CardTitle>

          {runId && (
            <div className="w-full mt-2">
              <p className="text-sm text-gray-600 mb-1">{status}</p>{" "}
              {/* Status above progress bar */}
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600 text-right mt-1">
                {progress.toFixed(0)}%
              </p>{" "}
              {/* % below progress bar */}
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 justify-center">
          {runId &&
            generatedImages.length === 0 &&
            batchSkeletons.map((_, index) => (
              <Skeleton key={index} className="w-32 h-32 rounded" />
            ))}

          {generatedImages.map((imageUrl, index) => (
            <div
              key={index}
              className="relative cursor-pointer"
              onClick={() => {
                setZoomModalOpen(true);
                setActiveImageIndex(index);
              }}
              style={{ width: "100%", maxWidth: "200px", aspectRatio: "1 / 1" }}
            >
              <Image
                src={imageUrl} // Using the image URL directly
                alt={`Generated Image ${index + 1}`}
                width={200}
                height={200}
                className="rounded object-contain"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ZoomModal */}
      {zoomModalOpen && (
        <ZoomModal
          images={generatedImages.map((url) => ({ url }))} // Wrap URLs in objects
          currentIndex={activeImageIndex}
          onClose={() => setZoomModalOpen(false)}
        />
      )}
    </div>
  );
};
