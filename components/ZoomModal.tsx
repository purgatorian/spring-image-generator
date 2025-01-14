import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Download, Heart, Share, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageData {
  url: string;
}

interface ZoomModalProps {
  images: ImageData[]; // Array of image data
  currentIndex: number; // Initially displayed image index
  onClose: () => void; // Function to close the modal
}

const ZoomModal: React.FC<ZoomModalProps> = ({ images, currentIndex, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  if (!images || images.length === 0) return null;

  const handleDownload = async () => {
    const image = images[activeIndex];
    if (!image?.url) return;
  
    try {
      // Fetch the image data
      const response = await fetch(image.url);
      if (!response.ok) {
        console.error("Failed to fetch image");
        return;
      }
  
      // Convert the response into a Blob
      const blob = await response.blob();
  
      // Create a URL for the Blob
      const blobUrl = URL.createObjectURL(blob);
  
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Generated_Image_${activeIndex + 1}.jpg`; // Set the file name
  
      // Append the link to the document and trigger a click
      document.body.appendChild(link);
      link.click();
  
      // Clean up: Remove the link and revoke the Blob URL
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevious = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).id === "zoom-modal-overlay") {
      onClose();
    }
  };

  return (
    <div
      id="zoom-modal-overlay"
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-md"
    >
      <div className="relative">
        {/* Image Navigation Controls */}
        {images.length > 1 && (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              className="bg-gray-200 dark:bg-gray-800 rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-6 h-6 text-black dark:text-white" />
            </Button>
          </div>
        )}
        {images.length > 1 && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
            <Button
              variant="ghost"
              onClick={handleNext}
              className="bg-gray-200 dark:bg-gray-800 rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-6 h-6 text-black dark:text-white" />
            </Button>
          </div>
        )}

        {/* Active Image */}
        <Image
          src={images[activeIndex].url}
          alt={`Zoomed Image ${activeIndex + 1}`}
          width={800}
          height={800}
          className="rounded"
        />

        {/* Overlay Buttons */}
        <div className="absolute top-2 right-2 flex space-x-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="bg-gray-200 dark:bg-gray-800 rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6 text-black dark:text-white" />
          </Button>
          <Button
            variant="ghost"
            onClick={handleDownload}
            className="bg-gray-200 dark:bg-gray-800 rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            <Download className="w-6 h-6 text-black dark:text-white" />
          </Button>
          <Button variant="ghost" className="bg-gray-200 dark:bg-gray-800 rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-700">
            <Heart className="w-6 h-6 text-red-500 dark:text-red-400" />
          </Button>
          <Button variant="ghost" className="bg-gray-200 dark:bg-gray-800 rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-700">
            <Share className="w-6 h-6 text-black dark:text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ZoomModal;
