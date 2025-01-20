"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { put } from "@vercel/blob";

// ✅ Define props for the component
interface ImageUploadSectionProps {
  onUploadComplete: (url: string) => void;
  onAnalyzeImage?: (imageUrl: string) => Promise<void>; // Optional if not always used
}


export default function ImageUploadSection({ onUploadComplete }: ImageUploadSectionProps) {
  const [uploadedImage, setUploadedImage] = useState<File & { preview: string } | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // ✅ Delete Image from Vercel Blob
  const deleteImage = useCallback(async (url: string) => {
    try {
      const response = await fetch("/api/delete-image", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: "Deleted", description: "Image deleted from Vercel Blob.", variant: "default" });
      } else {
        toast({ title: "Error", description: "Failed to delete image.", variant: "destructive" });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({ title: "Error", description: `Error deleting the image: ${error.message}`, variant: "destructive" });
      } else {
        toast({ title: "Error", description: "An unexpected error occurred while deleting the image.", variant: "destructive" });
      }
    }
  }, [toast]);

  // ✅ Upload to Vercel Blob
  const uploadToVercelBlob = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const result = await put(file.name, file, {
        access: "public",
        token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
      });
      setImageUrl(result.url);
      toast({ title: "Success", description: "Image uploaded to Vercel Blob!", variant: "default" });

      // ✅ Notify parent component after successful upload
      onUploadComplete(result.url);

      // ✅ Auto-delete after 1 hour
      setTimeout(() => {
        if (result.url) {
          deleteImage(result.url);
        }
      }, 3600000); // 1 hour in milliseconds

    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({ title: "Upload Error", description: `Error uploading image: ${error.message}`, variant: "destructive" });
      } else {
        toast({ title: "Unexpected Error", description: "An unexpected error occurred during upload.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
      setUploadedImage(null);
    }
  }, [toast, deleteImage, onUploadComplete]);  // ✅ Added onUploadComplete to dependencies

  // 📥 Handle File Drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith("image/")) {
      const previewFile = Object.assign(file, { preview: URL.createObjectURL(file) });
      setUploadedImage(previewFile);
      setImageUrl("");
      uploadToVercelBlob(file);
    } else {
      toast({ title: "Upload Error", description: "Only image files are accepted.", variant: "destructive" });
    }
  }, [toast, uploadToVercelBlob]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  // 🗑️ Delete when user clicks "Remove"
  const handleRemoveImage = () => {
    if (imageUrl) {
      deleteImage(imageUrl);
    }
    setUploadedImage(null);
    setImageUrl("");
  };

  // 🖼️ Image Preview with Loader
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
        <button onClick={handleRemoveImage} className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 m-1">X</button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={`border-2 border-dashed p-4 text-center cursor-pointer ${isDragActive ? 'border-blue-500' : 'border-gray-300'}`}>
        <input {...getInputProps()} />
        {renderImagePreview() || (
          <p>{isDragActive ? "Drop the image here..." : "Drag 'n' drop an image here, or click to select one."}</p>
        )}
      </div>
      <input
        type="text"
        placeholder="Paste image URL here..."
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="border p-2 w-full"
      />
    </div>
  );
}
