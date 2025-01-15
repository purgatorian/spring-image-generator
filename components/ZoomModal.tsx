import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  X,
  Download,
  Heart,
  Share,
  ChevronLeft,
  ChevronRight,
  Grid,
  Save,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const iconButtonClass =
    "bg-gray-200 dark:bg-gray-800 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700";

  return (
    <div
      id="zoom-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-md"
    >
      <div className="relative">
        {images.length > 1 && (
          <Button
            variant="ghost"
            onClick={() =>
              setActiveIndex(
                (prevIndex) => (prevIndex - 1 + images.length) % images.length
              )
            }
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 z-10 ${iconButtonClass}`}
          >
            <ChevronLeft className="w-6 h-6 text-black dark:text-white" />
          </Button>
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

        <Button
          variant="ghost"
          onClick={onClose}
          className={`absolute top-2 left-2 ${iconButtonClass}`}
        >
          <X className="w-6 h-6 text-black dark:text-white" />
        </Button>

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
          <CollectionPopover imageUrl={images[activeIndex].url} />
          <SharePopover imageUrl={images[activeIndex].url} />
        </div>
      </div>
    </div>
  );
};

export default ZoomModal;
