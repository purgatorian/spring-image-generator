// components/CollectionPopoverContent.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CollectionPopoverContentProps {
  imageUrl: string;
  onCollectionChange?: () => void; // Optional callback when collections are updated
}

interface Collection {
  id: string;
  name: string;
  images: { id: string; url: string }[];
}

const CollectionPopoverContent: React.FC<CollectionPopoverContentProps> = ({
  imageUrl,
  onCollectionChange,
}) => {
  const [collectionName, setCollectionName] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchCollections = useCallback(async () => {
    try {
      const response = await fetch("/api/collections");
      const data: Collection[] = await response.json();  // Explicitly typing the data
  
      setCollections(Array.isArray(data) ? data : []);
  
      setSelectedCollections(
        data
          .filter((col: Collection) =>
            col.images.some((img) => img.url === imageUrl)
          )
          .map((col: Collection) => col.id)  // Explicitly type 'col'
      );
    } catch {
      toast({
        title: "Error!",
        description: "Failed to fetch collections.",
        variant: "destructive",
      });
    }
  }, [imageUrl, toast]);
  

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

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

        toast({
          title: "Success!",
          description: checked
            ? "Image added to the collection."
            : "Image removed from the collection.",
        });

        onCollectionChange?.(); // Notify parent to refresh the favorite state
      } else {
        throw new Error();
      }
    } catch {
      toast({
        title: "Error!",
        description: "Failed to update the collection.",
        variant: "destructive",
      });
    }
  };

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
        await fetchCollections();
        toast({
          title: "Success!",
          description: "New collection created and image added.",
        });
        onCollectionChange?.();
      } else {
        throw new Error();
      }
    } catch {
      toast({
        title: "Error!",
        description: "Failed to create the collection.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
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
        <div key={col.id} className="flex items-center space-x-2 my-1">
          <Checkbox
            checked={selectedCollections.includes(col.id)}
            onCheckedChange={(checked) =>
              handleCollectionSelect(col.id, checked as boolean)
            }
          />
          <span>{col.name}</span>
        </div>
      ))}
    </div>
  );
};

export default CollectionPopoverContent;
