"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ChevronsUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import ZoomModal from "@/components/ZoomModal";
import { buildTextModePayload } from "@/app/api/generate/route";
import { useTaskStatus } from "@/app/api/hooks/useTaskStatus";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Lock, LockOpen, Download, Share, Heart, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
const models = [
  { value: "1", label: "Dream Deliberate" },
  { value: "2", label: "Dream Shaper" },
  { value: "3", label: "SDXL" },
  { value: "4", label: "SDXL ST" },
  { value: "5", label: "SDXL Turbo" },
];

const ImageRenderer = ({ image, onRemove }) => (
  <div className="relative group w-64 h-64">
    <Image
      src={image.preview || image}
      alt="Uploaded Image"
      fill
      className="object-cover rounded"
    />
    <button
      onClick={onRemove} // This is where onRemove is used
      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
    >
      <X size={20} />
    </button>
  </div>
);

export const GeneratePrint = () => {
  const [batchSkeletons, setBatchSkeletons] = useState([]);
  const [mode, setMode] = useState("text");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
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

  const handleDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedImage(
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );
    }
  };

  const handleAddUrlImage = () => {
    if (uploadedImageUrl) {
      setUploadedImage({ preview: uploadedImageUrl });
      setUploadedImageUrl("");
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: { "image/jpeg": [], "image/png": [] },
    multiple: false,
  });

  const handleGenerate = async () => {
    setIsGenerating(true); // Disable button and show spinner
    setGeneratedImages([]);
    setProgress(0);
    setBatchSkeletons(Array.from({ length: parameters.batchSize }));

    let payload;

    if (mode === "text") {
      payload = {
        apiEndpoint: "https://api.instasd.com/api_endpoints/ma5o39at1e9gnd",
        payload: {
          ...buildTextModePayload(
            document.querySelector(
              "textarea[placeholder='Describe in detail what the print should look like...']"
            ).value,
            document.querySelector(
              "textarea[placeholder='Negative prompts (optional)...']"
            ).value || "",
            parameters
          ),
        },
      };
    } else if (mode === "image" && uploadedImage) {
      payload = {
        apiEndpoint:
          "https://api.instasd.com/api_endpoints/your_image_endpoint",
        payload: {
          mode: "image",
          uploadedImage: uploadedImage.preview,
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

      if (!response.ok) throw new Error("Failed to queue generation");

      const { task_id } = await response.json();
      setRunId(task_id); // This triggers useTaskStatus
      setStatus("queued");
    } catch (error) {
      console.error("Error:", error);
      setStatus("Error while queuing generation");
    } finally {
      setIsGenerating(false); // Re-enable button after completion
    }
  };

  useTaskStatus(
    runId,
    "https://api.instasd.com/api_endpoints/ma5o39at1e9gnd",
    (progress) => setProgress(progress),
    (imageUrls) => {
      setGeneratedImages(imageUrls); // Save the image URLs
      setStatus("Completed");
    },

    (error) => setStatus(error)
  );

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
              />
              <Textarea
                placeholder="Negative prompts (optional)..."
                rows={3}
                className="w-full"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Drag and Drop Section */}
              <div {...getRootProps()} className="p-4 border rounded-md">
                <input {...getInputProps()} />
                <p className="text-center text-gray-500 text-sm">
                  Drag & drop images here, or click to select files
                </p>
              </div>

              {/* URL Upload Section */}
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Or upload via URL..."
                  value={uploadedImageUrl}
                  onChange={(e) => setUploadedImageUrl(e.target.value)}
                />
                <Button onClick={handleAddUrlImage}>Add Image</Button>
              </div>

              {/* Image Gallery */}
              <div className="flex overflow-x-auto gap-4">
                {uploadedImage && (
                  <ImageRenderer
                    image={uploadedImage}
                    onRemove={() => setUploadedImage(null)} // This allows the user to remove the image
                  />
                )}
              </div>
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
