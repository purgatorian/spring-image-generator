import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CollectionPopoverProps {
  imageUrl: string;
}

interface Collection {
  id: string;
  name: string;
  images: { id: string; url: string }[];  // ✅ Updated to match relational model
}

const CollectionPopover: React.FC<CollectionPopoverProps> = ({ imageUrl }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const { toast } = useToast();

  // ✅ Success Toast
  const showSuccessToast = (message: string) => {
    toast({
      title: "Success!",
      description: message,
      variant: "default",
    });
  };

  // ❌ Error Toast
  const showErrorToast = useCallback((message: string) => {
    toast({
      title: "Error!",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  // ✅ Fetch collections from the API
  const fetchCollections = useCallback(async () => {
    try {
      const response = await fetch("/api/collections");
      const data = await response.json();
      setCollections(Array.isArray(data) ? data : []);
  
      const existingCollections = data.filter((col: Collection) =>
        col.images.some((img) => img.url === imageUrl)
      );
      setSelectedCollections(existingCollections.map((col) => col.id));
    } catch (error) {
      console.error("Error fetching collections:", error);
      showErrorToast("Failed to fetch collections.");
    }
  }, [imageUrl, showErrorToast]);  // ✅ Added showErrorToast
  
  useEffect(() => {
    if (popoverOpen) {
      fetchCollections();
    }
  }, [popoverOpen, fetchCollections]);  // ✅ No more warning

  // ✅ Handle image addition or removal from a collection
  const handleCollectionSelect = async (collectionId: string, checked: boolean) => {
    try {
      const url = checked
        ? `/api/collections/${collectionId}/add-image`
        : `/api/collections/${collectionId}/remove-image`;
      const method = checked ? "POST" : "DELETE";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (response.ok) {
        setSelectedCollections((prev) =>
          checked ? [...prev, collectionId] : prev.filter((id) => id !== collectionId)
        );
        showSuccessToast(
          checked ? "Image added to the collection." : "Image removed from the collection."
        );
      } else {
        showErrorToast("Failed to update the collection.");
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      showErrorToast("An error occurred while updating the collection.");
    }
  };

  // ✅ Handle new collection creation
  const handleCreateCollection = async () => {
    if (!collectionName.trim()) return;

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: collectionName, imageUrl }),
      });

      if (response.ok) {
        setCollectionName("");
        await fetchCollections();  // ✅ Refresh the collections list
        showSuccessToast("New collection created and image added.");
      } else {
        showErrorToast("Failed to create the collection.");
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      showErrorToast("An error occurred while creating the collection.");
    }
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="bg-gray-200 dark:bg-gray-800 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          <Heart
            className={`w-6 h-6 ${
              selectedCollections.length
                ? "fill-red-500"
                : "text-black dark:text-white"
            }`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex items-center space-x-2 mb-2">
          <Input
            placeholder="New Collection"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
          <Button onClick={handleCreateCollection}>
            <Save />
          </Button>
        </div>

        {collections.map((col) => (
          <div
            key={col.id}
            className="flex items-center space-x-2 my-1"
          >
            <Checkbox
              checked={selectedCollections.includes(col.id)}
              onCheckedChange={(checked) =>
                handleCollectionSelect(col.id, checked as boolean)
              }
            />
            <span>{col.name}</span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default CollectionPopover;
