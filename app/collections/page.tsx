"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Trash2, Plus, Check } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  images: string[];
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [renamePopoverOpen, setRenamePopoverOpen] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/collections");
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
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
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  const handleRenameCollection = async (id: string, newName: string) => {
    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (response.ok) {
        fetchCollections();
        setRenamePopoverOpen(null);
      }
    } catch (error) {
      console.error("Error renaming collection:", error);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setCollections((prev) => prev.filter((collection) => collection.id !== id));
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
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
            <p>Loading collections...</p>
          ) : collections.length === 0 ? (
            <p>No collections found.</p>
          ) : (
            collections.map((collection) => (
              <div key={collection.id} className="relative">
                <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg cursor-pointer">
                  <Link href={`/collections/${collection.id}`} className="block">
                    <div className="grid grid-cols-2 grid-rows-2 gap-0">
                      {collection.images.slice(-4).map((img, index) => (
                        <Image
                          key={index}
                          src={img}
                          alt={`Collection ${collection.name}`}
                          width={150}
                          height={150}
                          className="object-cover w-full h-full"
                        />
                      ))}
                    </div>
                  </Link>
                  <div className="p-2 text-center flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{collection.name}</p>
                      <p className="text-sm text-gray-500">{collection.images.length} images</p>
                    </div>
                    <Popover open={renamePopoverOpen === collection.id} onOpenChange={(open) => {
                      setRenamePopoverOpen(open ? collection.id : null);
                      setRenameValue(open ? collection.name : "");
                    }}>
                      <PopoverTrigger asChild>
                        <Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal size={16} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Input
                          placeholder="Rename collection"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="mb-2"
                        />
                        <Button onClick={() => handleRenameCollection(collection.id, renameValue)}>
                          <Check size={16} className="mr-2" /> Save
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteCollection(collection.id)}
                          className="mt-4"
                        >
                          <Trash2 size={16} className="mr-2" /> Delete
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button className="fixed bottom-6 right-6 rounded-full shadow-lg">
            <Plus size={16} className="mr-2" /> New Collection
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4">
          <Input
            placeholder="Collection name"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
          />
          <Button className="mt-2 w-full" onClick={handleCreateCollection}>Save</Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
