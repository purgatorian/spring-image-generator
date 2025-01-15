// components/DownloadButton.tsx
import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  imageUrl: string;
  index: number;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ imageUrl, index }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Generated_Image_${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <Button variant="ghost" onClick={handleDownload} className="bg-gray-200 dark:bg-gray-800 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700">
      <Download className="w-6 h-6 text-black dark:text-white" />
    </Button>
  );
};

export default DownloadButton;