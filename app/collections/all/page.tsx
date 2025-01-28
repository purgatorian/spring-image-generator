"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import ZoomModal from "@/components/ZoomModal";

interface ImageData {
  id: string;
  url: string;
}

export default function AllCollectionsPage() {
  const [allImages, setAllImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const fetchAllImages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/collections/all"); // Use the new API route
      if (!response.ok) throw new Error("Failed to fetch all images.");
      const data = await response.json();
      setAllImages(data.images);
    } catch (error) {
      console.error("Error fetching all images:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllImages();
  }, [fetchAllImages]);

  const handleImageClick = (url: string) => {
    setActiveImage(url);
    setZoomModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
        <span className="ml-2">Loading images...</span>
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">All Images</h1>

      {allImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allImages.map((image) => (
            <div key={image.id} className="relative w-full">
              <Image
                src={image.url}
                alt={`Image ${image.id}`}
                width={300}
                height={200}
                className="rounded-lg shadow-md cursor-pointer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/no-image.jpg"; // Fallback to default image
                }}
                unoptimized
                onClick={() => handleImageClick(image.url)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No images in this collection yet.</div>
      )}

      {/* Zoom Modal */}
      {zoomModalOpen && activeImage && (
        <ZoomModal
          images={allImages.map((img) => ({ url: img.url }))}
          currentIndex={allImages.findIndex((img) => img.url === activeImage)}
          onClose={() => setZoomModalOpen(false)}
        />
      )}
    </div>
  );
}
