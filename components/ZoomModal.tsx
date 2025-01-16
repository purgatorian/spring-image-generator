import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Grid, Heart } from "lucide-react";
import DownloadButton from "./DownloadButton";
import CollectionPopover from "./CollectionPopover";
import SharePopover from "@/components/SharePopover";

interface ZoomModalProps {
  images: { url: string }[];
  currentIndex: number;
  onClose: () => void;
}

const ZoomModal: React.FC<ZoomModalProps> = ({
  images,
  currentIndex,
  onClose,
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isTiled, setIsTiled] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const iconButtonClass =
    "bg-gray-200 dark:bg-gray-800 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700";
    interface Image {
      id: string;
      url: string;
    }
    
    interface Collection {
      id: string;
      name: string;
      images: Image[];
    }
  // ✅ Fetch if the current image is in any collection
  const checkIfFavorite = useCallback(async (imageUrl: string) => {
    try {
      const response = await fetch("/api/collections");
      const collections: Collection[] = await response.json();

      const isInCollection = collections.some((collection) =>
        collection.images.some((img) => img.url === imageUrl)
      );

      setIsFavorite(isInCollection);
    } catch (error) {
      console.error("Error checking collections:", error);
    }
  }, []);  // ✅ No dependencies because nothing dynamic is used inside

  // ✅ Include checkIfFavorite in dependencies
  useEffect(() => {
    checkIfFavorite(images[activeIndex].url);
  }, [activeIndex, images, checkIfFavorite]);

  // ✅ Navigate to the previous image
  const handlePrev = () => {
    setActiveIndex((prevIndex) =>
      (prevIndex - 1 + images.length) % images.length
    );
  };

  // ✅ Navigate to the next image
  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div
      id="zoom-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-md"
    >
      <div className="relative">
        {images.length > 1 && (
          <>
            {/* ✅ Left Chevron */}
            <Button
              variant="ghost"
              onClick={handlePrev}
              className={`absolute left-2 top-1/2 transform -translate-y-1/2 z-10 ${iconButtonClass}`}
            >
              <ChevronLeft className="w-6 h-6 text-black dark:text-white" />
            </Button>

            {/* ✅ Right Chevron */}
            <Button
              variant="ghost"
              onClick={handleNext}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 z-10 ${iconButtonClass}`}
            >
              <ChevronRight className="w-6 h-6 text-black dark:text-white" />
            </Button>
          </>
        )}

        <div
          className={`relative ${
            isTiled ? "grid grid-cols-3 grid-rows-3 gap-0" : ""
          }`}
        >
          {isTiled ? (
            Array.from({ length: 9 }).map((_, idx) => (
              <Image
                key={idx}
                src={images[activeIndex].url}
                alt={`Tiled Image ${activeIndex + 1}`}
                width={250}
                height={250}
                className="rounded m-0"
              />
            ))
          ) : (
            <Image
              src={images[activeIndex].url}
              alt={`Zoomed Image ${activeIndex + 1}`}
              width={800}
              height={800}
              className="rounded"
            />
          )}
        </div>

        {/* ✅ Close Button */}
        <Button
          variant="ghost"
          onClick={onClose}
          className={`absolute top-2 left-2 ${iconButtonClass}`}
        >
          <X className="w-6 h-6 text-black dark:text-white" />
        </Button>

        {/* ✅ Action Buttons */}
        <div className="absolute top-2 right-2 flex space-x-2">
          <DownloadButton
            imageUrl={images[activeIndex].url}
            index={activeIndex}
          />
          <Button
            variant="ghost"
            onClick={() => setIsTiled((prev) => !prev)}
            className={iconButtonClass}
          >
            <Grid className="w-6 h-6 text-black dark:text-white" />
          </Button>

          {/* ✅ Heart Icon reflecting favorite status */}
          <Button variant="ghost" className={iconButtonClass}>
            <Heart
              className={`w-6 h-6 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-black dark:text-white"
              }`}
            />
          </Button>

          <CollectionPopover imageUrl={images[activeIndex].url} />
          <SharePopover imageUrl={images[activeIndex].url} />
        </div>
      </div>
    </div>
  );
};

export default ZoomModal;
