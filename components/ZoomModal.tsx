import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Download, Heart, Share, ChevronLeft, ChevronRight, Grid } from "lucide-react";

interface ImageData {
  url: string;
}

interface ZoomModalProps {
  images: ImageData[];
  currentIndex: number;
  onClose: () => void;
}

const ZoomModal: React.FC<ZoomModalProps> = ({ images, currentIndex, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isTiled, setIsTiled] = useState(false);

  if (!images || images.length === 0) return null;

  const handleDownload = async () => {
    const image = images[activeIndex];
    if (!image?.url) return;

    try {
      const response = await fetch(image.url);
      if (!response.ok) {
        console.error("Failed to fetch image");
        return;
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Generated_Image_${activeIndex + 1}.jpg`;

      document.body.appendChild(link);
      link.click();

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

  const toggleTiling = () => {
    setIsTiled((prev) => !prev);
  };

  return (
    <div
      id="zoom-modal-overlay"
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-md"
    >
      <div className="relative">
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

        <div className={`relative ${isTiled ? "grid grid-cols-3 grid-rows-3" : ""}`}>
          {isTiled
            ? Array.from({ length: 9 }).map((_, idx) => (
                <Image
                  key={idx}
                  src={images[activeIndex].url}
                  alt={`Tiled Image ${activeIndex + 1}`}
                  width={250}
                  height={250}
                  className="rounded m-0"
                />
              ))
            : (
              <Image
                src={images[activeIndex].url}
                alt={`Zoomed Image ${activeIndex + 1}`}
                width={800}
                height={800}
                className="rounded"
              />
            )}
        </div>

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
          <Button
            variant="ghost"
            onClick={toggleTiling}
            className="bg-gray-200 dark:bg-gray-800 rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            <Grid className="w-6 h-6 text-black dark:text-white" />
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
