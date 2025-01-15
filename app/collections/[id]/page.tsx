"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ImageData {
  id: string;
  url: string;
}

interface CollectionData {
  id: string;
  name: string;
  images: ImageData[];
}

export default function CollectionPage() {
  const params = useParams();
  const id = params?.id as string;
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/collections/${id}`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Collection not found.");
        } else if (res.status === 401) {
          throw new Error("Unauthorized access.");
        } else {
          throw new Error("Failed to fetch collection.");
        }
      }

      const data = await res.json();
      setCollection(data);
    } catch (error: any) {
      console.error('Error fetching collection:', error);
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, [id]);

  // 🔄 Retry Button on Error
  const handleRetry = () => {
    fetchCollection();
  };

  // 🌀 Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
        <span className="ml-2">Loading collection...</span>
      </div>
    );
  }

  // ❌ Error State
  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>{error}</p>
        <Button onClick={handleRetry} className="mt-4">Retry</Button>
      </div>
    );
  }

  // ⚠️ Collection Not Found
  if (!collection) {
    return <div className="text-center py-10">Collection not found.</div>;
  }

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">
        {collection.name}
      </h1>

      {collection.images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {collection.images.map((image) => (
            <div key={image.id} className="relative w-full">
              <Image
                src={image.url}
                alt={`Image ${image.id}`}
                width={300}               // ✅ Use fixed width
                height={200}              // ✅ Maintain aspect ratio
                objectFit="cover"
                className="rounded-lg shadow-md"
                placeholder="blur"
                blurDataURL="/placeholder.png"  // ✅ Use a blur placeholder
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No images in this collection yet.</div>
      )}
    </div>
  );
}
