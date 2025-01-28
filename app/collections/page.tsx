//app/collections/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Trash2, Plus, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageData {
  id: string;
  url: string;
}

interface Collection {
  id: string;
  name: string;
  images: ImageData[];
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allImages, setAllImages] = useState<ImageData[]>([]); // ✅ All images for the "All" collection
  const [loading, setLoading] = useState(true);
  const [actionLoadingIds, setActionLoadingIds] = useState<Set<string>>(new Set());
  const [newCollectionName, setNewCollectionName] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [renamePopoverOpen, setRenamePopoverOpen] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const { toast } = useToast();

  const startLoading = (id: string) => setActionLoadingIds((prev) => new Set(prev).add(id));
  const stopLoading = (id: string) => setActionLoadingIds((prev) => {
    const next = new Set(prev);
    next.delete(id);
    return next;
  });

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/collections");
      const data = await response.json();

        // ✅ Aggregate all unique images for the "All" collection
        const allImagesSet = new Map<string, ImageData>();
        data.forEach((collection: Collection) => {
          collection.images.forEach((image) => {
            if (!allImagesSet.has(image.url)) {
              allImagesSet.set(image.url, image);
            }
          });
        });

      setCollections(data);
      setAllImages(Array.from(allImagesSet.values())); // ✅ Convert Map to Array

    } catch (error) {
      console.error("Error fetching collections:", error);
      toast({
        title: "Error",
        description: "Failed to fetch collections.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    startLoading("create");
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCollectionName, imageUrl: "" }),
      });

      if (response.ok) {
        fetchCollections();
        setNewCollectionName("");
        setPopoverOpen(false);
        toast({ title: "Success", description: "Collection created." });
      } else {
        const errorMsg = (await response.json()).message || "Failed to create collection.";
        toast({ title: "Error", description: errorMsg, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      toast({ title: "Error", description: "Failed to create collection.", variant: "destructive" });
    } finally {
      stopLoading("create");
    }
  };

  const handleRenameCollection = async (id: string, newName: string) => {
    if (!newName.trim()) return;

    startLoading(id);
    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        fetchCollections();
        setRenamePopoverOpen(null);
        toast({ title: "Success", description: "Collection renamed." });
      } else {
        const errorMsg = (await response.json()).message || "Failed to rename collection.";
        toast({ title: "Error", description: errorMsg, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error renaming collection:", error);
      toast({ title: "Error", description: "Failed to rename collection.", variant: "destructive" });
    } finally {
      stopLoading(id);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    startLoading(id);
    try {
      await fetch(`/api/collections/${id}`, { method: "DELETE" });
      setCollections((prev) => prev.filter((collection) => collection.id !== id));
      toast({ title: "Success", description: "Collection deleted." });
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast({ title: "Error", description: "Failed to delete collection.", variant: "destructive" });
    } finally {
      stopLoading(id);
    }
  };

  return (
    <div className="p-6 ml-4 relative">
      <Card>
        <CardHeader>
          <CardTitle>Your Collections</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="text-center py-6 flex items-center justify-center">
              <Loader2 className="animate-spin w-6 h-6" /> Loading collections...
            </div>
          ) : collections.length === 0 ? (
            <p>No collections found.</p>
          ) : (
            <>
            {/* "All" Collection Card */}
            <div className="relative flex flex-col">
              <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg flex-grow flex flex-col">
                <Link href="/collections/all" className="block flex-grow">
                  <div className="grid grid-cols-2 grid-rows-2 gap-0 h-48">
                    {allImages.length > 0 ? (
                      allImages.slice(0, 4).map((img, index) => (
                        <Image
                          key={index}
                          src={img.url}
                          alt="All Collection Image"
                          width={150}
                          height={150}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      ))
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">
                        No Images
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-2 text-center">
                  <p className="font-semibold">All</p>
                  <p className="text-sm text-gray-500">
                    {allImages.length} {allImages.length === 1 ? "image" : "images"}
                  </p>
                </div>
              </div>
            </div>
            {collections.map((collection) => (
              <div key={collection.id} className="relative flex flex-col">
                <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg flex-grow flex flex-col">
                  <Link href={`/collections/${collection.id}`} className="block flex-grow">
                    <div className="grid grid-cols-2 grid-rows-2 gap-0 h-48">
                      {collection.images.length > 0 ? (
                        collection.images.slice(-4).map((img) => (
                          <Image
                            key={img.id}
                            src={img.url}
                            alt={`Image in collection ${collection.name}`}
                            width={150}
                            height={150}
                            className="object-cover w-full h-full"
                            loading="lazy"
                          />
                        ))
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">
                          No Images
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-2 text-center flex items-center justify-between">
                    <div>
                      <p className="font-semibold truncate">{collection.name}</p>
                      <p className="text-sm text-gray-500">
                        {collection.images.length} {collection.images.length === 1 ? "image" : "images"}
                      </p>
                    </div>
                    <Popover
                      open={renamePopoverOpen === collection.id}
                      onOpenChange={(open) => {
                        setRenamePopoverOpen(open ? collection.id : null);
                        setRenameValue(open ? collection.name : "");
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal size={16} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Input
                          placeholder={`Current name: ${collection.name}`}
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="mb-2"
                        />
                        <Button
                          onClick={() => handleRenameCollection(collection.id, renameValue)}
                          disabled={actionLoadingIds.has(collection.id)}
                        >
                          {actionLoadingIds.has(collection.id) ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Check size={16} className="mr-2" />
                          )}{" "}
                          Save
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteCollection(collection.id)}
                          disabled={actionLoadingIds.has(collection.id)}
                          className="mt-4"
                        >
                          {actionLoadingIds.has(collection.id) ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Trash2 size={16} className="mr-2" />
                          )}{" "}
                          Delete
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            ))}
            </>
          )}
        </CardContent>
      </Card>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button className="fixed bottom-6 right-6 rounded-full shadow-lg">
            {actionLoadingIds.has("create") ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Plus size={16} className="mr-2" />
            )}{" "}
            New Collection
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4">
          <Input
            placeholder="Collection name"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
          />
          <Button className="mt-2 w-full" onClick={handleCreateCollection}>
            Save
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
