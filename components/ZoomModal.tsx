import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Grid, Heart } from "lucide-react";
import DownloadButton from "./DownloadButton";
import SharePopover from "@/components/SharePopover";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import CollectionPopoverContent from "./CollectionPopover";

interface ZoomModalProps {
  images: { url: string }[];
  currentIndex: number;
  onClose: () => void;
}
// ✅ Define Image and Collection types
interface Image {
  id: string;
  url: string;
}

interface Collection {
  id: string;
  name: string;
  images: Image[];
}

const ZoomModal: React.FC<ZoomModalProps> = ({
  images,
  currentIndex,
  onClose,
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTiled, setIsTiled] = useState(false);

  const iconButtonClass =
    "bg-gray-200 dark:bg-gray-800 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700";

 // ✅ Check if the current image is in any collection
  const checkIfFavorite = useCallback(async (imageUrl: string) => {
    try {
      const response = await fetch("/api/collections");
      const data: Collection[] = await response.json();  // Properly typed

      const inCollection = data.some((col: Collection) =>
        col.images.some((img: Image) => img.url === imageUrl)
      );

      setIsFavorite(inCollection);
    } catch (error) {
      console.error("Failed to check favorite status", error);
    }
  }, []);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-md overflow-auto"
    >
      <div className="relative max-w-full max-h-full p-2 md:p-4">
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              onClick={handlePrev}
              className={`absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-10 ${iconButtonClass}`}
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-black dark:text-white" />
            </Button>

            <Button
              variant="ghost"
              onClick={handleNext}
              className={`absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-10 ${iconButtonClass}`}
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-black dark:text-white" />
            </Button>
          </>
        )}

        <div
          className={`relative flex items-center justify-center ${
            isTiled ? "grid grid-cols-4 grid-rows-4 gap-0" : ""
          }`}
        >
          {isTiled ? (
            Array.from({ length: 16 }).map((_, idx) => (
              <Image
                key={idx}
                src={images[activeIndex].url}
                alt={`Tiled Image ${activeIndex + 1}`}
                width={256}
                height={256}
                className="rounded object-contain w-full h-auto max-h-[22.5vh] max-w-[22.5vw]"
              />
            ))
          ) : (
            <Image
              src={images[activeIndex].url}
              alt={`Zoomed Image ${activeIndex + 1}`}
              width={1024}
              height={1024}
              className="rounded object-contain w-full h-auto max-h-[90vh] max-w-[90vw]"
            />
          )}
        </div>

        <Button
          variant="ghost"
          onClick={onClose}
          className={`absolute top-5 left-5 ${iconButtonClass}`}
        >
          <X className="w-6 h-6 md:w-8 md:h-8 text-black dark:text-white" />
        </Button>

        <div className="absolute top-5 right-5 flex space-x-2">
          <DownloadButton
            imageUrl={images[activeIndex].url}
            index={activeIndex}
          />

          <Button
            variant="ghost"
            onClick={() => setIsTiled((prev) => !prev)}
            className={iconButtonClass}
          >
            <Grid className="w-6 h-6 md:w-8 md:h-8 text-black dark:text-white" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className={iconButtonClass}>
                <Heart
                  className={`w-6 h-6 md:w-8 md:h-8 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-black dark:text-white"
                  }`}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <CollectionPopoverContent
                imageUrl={images[activeIndex].url}
                onCollectionChange={() => checkIfFavorite(images[activeIndex].url)}
              />
            </PopoverContent>
          </Popover>

          <SharePopover imageUrl={images[activeIndex].url} />
        </div>
      </div>
    </div>
  );
};

export default ZoomModal;
