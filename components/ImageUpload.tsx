// app/components/ImageUpload.tsx
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { put } from "@vercel/blob";
import { Clipboard } from "lucide-react";

interface ImageUploadSectionProps {
  onUploadComplete: (url: string) => void;
  onRemoveImage?: () => void; // <--- NEW callback prop
}

export default function ImageUploadSection({
  onUploadComplete,
  onRemoveImage,
}: ImageUploadSectionProps) {
  const [uploadedImage, setUploadedImage] = useState<File & { preview: string } | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const deleteImage = useCallback(
    async (url: string) => {
      try {
        const response = await fetch("/api/delete-image", {
          method: "POST",
          body: JSON.stringify({ url }),
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: "Deleted",
            description: "Image deleted from Vercel Blob.",
            variant: "default",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to delete image.",
            variant: "destructive",
          });
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast({
            title: "Error",
            description: `Error deleting the image: ${error.message}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "An unexpected error occurred while deleting the image.",
            variant: "destructive",
          });
        }
      }
    },
    [toast]
  );

  const uploadToVercelBlob = useCallback(
    async (file: File) => {
      setLoading(true);
      try {
        const result = await put(file.name, file, {
          access: "public",
          token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
        });
        setImageUrl(result.url);
        toast({
          title: "Success",
          description: "Image uploaded to Vercel Blob!",
          variant: "default",
        });

        onUploadComplete(result.url);

        // Auto-delete after 1 hour
        setTimeout(() => {
          if (result.url) {
            deleteImage(result.url);
          }
        }, 3600000);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast({
            title: "Upload Error",
            description: `Error uploading image: ${error.message}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Unexpected Error",
            description: "An unexpected error occurred during upload.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
        setUploadedImage(null);
      }
    },
    [toast, deleteImage, onUploadComplete]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && file.type.startsWith("image/")) {
        const previewFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        setUploadedImage(previewFile);
        setImageUrl("");
        uploadToVercelBlob(file);
      } else {
        toast({
          title: "Upload Error",
          description: "Only image files are accepted.",
          variant: "destructive",
        });
      }
    },
    [toast, uploadToVercelBlob]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  // Delete local and remote references
  const handleRemoveImage = () => {
    if (imageUrl) {
      deleteImage(imageUrl);
    }
    setUploadedImage(null);
    setImageUrl("");

    // Notify parent that user removed the image
    onRemoveImage?.();
  };

  // New function to read from clipboard and validate URL
  const handlePasteClipboard = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      new URL(clipboardText); // Validate URL will throw if invalid
      setImageUrl(clipboardText);

      // Also call onUploadComplete if you want the parent
      // to treat it the same as an upload
      onUploadComplete(clipboardText);

      toast({
        title: "URL Pasted",
        description: "Successfully pasted a valid URL.",
        variant: "default",
      });
    } catch {
      toast({
        title: "Invalid URL",
        description: "Clipboard text is not a valid URL or read failed.",
        variant: "destructive",
      });
    }
  }, [onUploadComplete, toast]);

  const renderImagePreview = () => {
    const imageSrc = uploadedImage ? uploadedImage.preview : imageUrl;
    if (!imageSrc) return null;

    return (
      <div className="relative inline-block">
        <Image
          src={imageSrc}
          alt="Preview"
          width={128}
          height={192}
          className="object-cover rounded"
        />
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
            <span className="text-white">Uploading...</span>
          </div>
        )}
        <button
          onClick={handleRemoveImage}
          className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 m-1"
        >
          X
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-4 text-center cursor-pointer ${
          isDragActive ? "border-blue-500" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {renderImagePreview() || (
          <p>
            {isDragActive
              ? "Drop the image here..."
              : "Drag 'n' drop an image here, or click to select one."}
          </p>
        )}
      </div>

      {/* Display-only URL field + clipboard button */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Pasted image URL will appear here..."
          value={imageUrl}
          disabled
          className="border p-2 w-full bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <button
          type="button"
          onClick={handlePasteClipboard}
          className="rounded border border-gray-300 px-3 py-2 hover:bg-gray-100 transition"
        >
          <Clipboard className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
