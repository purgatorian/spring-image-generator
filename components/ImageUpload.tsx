"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export default function ImageUploadSection() {
  const [uploadedImage, setUploadedImage] = useState<File & { preview: string } | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // ✅ Wrapping uploadToPicallow in useCallback
  const uploadToPicallow = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("https://api.picallow.com/v1/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 && response.data.url) {
        setImageUrl(response.data.url); // Public URL from Picallow
        toast({ title: "Success", description: "Image uploaded to Picallow!", variant: "default" });
      } else {
        toast({ title: "Upload Error", description: "Upload failed on Picallow.", variant: "destructive" });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({ title: "Upload Error", description: `Error uploading to Picallow: ${error.message}`, variant: "destructive" });
      } else {
        toast({ title: "Unexpected Error", description: "An unexpected error occurred.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
      setUploadedImage(null);
    }
  }, [toast]);

  // ✅ onDrop uses uploadToPicallow safely
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith("image/")) {
      const previewFile = Object.assign(file, { preview: URL.createObjectURL(file) });
      setUploadedImage(previewFile);
      setImageUrl(""); // Clear URL input
      uploadToPicallow(file); // Auto-upload after selection
    } else {
      toast({ title: "Upload Error", description: "Only image files are accepted.", variant: "destructive" });
    }
  }, [toast, uploadToPicallow]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImageUrl("");
    toast({ title: "Removed", description: "Image has been removed.", variant: "default" });
  };

  const renderImagePreview = () => {
    const imageSrc = uploadedImage ? uploadedImage.preview : imageUrl;
    if (!imageSrc) return null;

    return (
      <div className="relative inline-block">
        <Image src={imageSrc} alt="Preview" width={128} height={128} className="object-cover rounded" />
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
            <span className="text-white">Uploading...</span>
          </div>
        )}
        <button onClick={handleRemoveImage} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">X</button>
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
