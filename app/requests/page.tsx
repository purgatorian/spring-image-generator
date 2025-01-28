//app/requests/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import ZoomModal from "@/components/ZoomModal";
import { Loader2, MoreHorizontal, RefreshCcw } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface Request {
  id: string;
  taskId: string;  // ✅ Added taskId to the interface
  createdAt: string;
  cost: number;
  status: string;
  imageUrls: string;
  videoUrls: string;
  mode: string;
}

// Define the type for activeImage state
interface ActiveImage {
  images: { url: string }[]; // Array of image objects with a `url` property
  index: number;            // The current index of the image being viewed
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<ActiveImage | null>(null); // Update the state type
  const formatCost = (cost: number) => `$${(cost / 1000000).toFixed(6)}`;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/get-requests");
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatMode = (mode: string) => {
    switch (mode) {
      case "text":
        return "Text to Image";
      case "image":
        return "Image to Image";
      case "clothing":
        return "Clothing";
      case "model":
        return "Model";
      default:
        return "Unknown";
    }
  };

  const handleImageClick = (imageUrls: string, index: number) => {
    const images = JSON.parse(imageUrls || "[]").map((url: string) => ({ url })); // Parse the image URLs
    setActiveImage({ images, index }); // Update the state with images and index
    setZoomModalOpen(true);            // Open the modal
  };

  const handleUpdate = async (taskId: string, mode: string) => {
    setActionLoading(taskId);
    try {
      const response = await fetch(`/api/generate?task_id=${taskId}&apiMode=${mode}`);
      
      if (!response.ok) {
        throw new Error("Failed to refresh data.");
      }

      await fetchRequests();  // Refresh UI
    } catch (error) {
      console.error("Error updating request:", error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="ml-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6 flex items-center justify-center">
              <Loader2 className="animate-spin w-6 h-6" /> Loading Requests...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created At</TableHead>
                  <TableHead>Cost ($)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => {
                  const images = JSON.parse(req.imageUrls || "[]");
                  const videos = JSON.parse(req.videoUrls || "[]");
                  return (
                    <TableRow key={req.id}>
                      <TableCell>{new Date(req.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{formatCost(req.cost)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
                      </TableCell>
                      <TableCell>{formatMode(req.mode)}</TableCell>
                      <TableCell>
                        {images.length > 0 ? (
                          <div
                            className="flex items-center cursor-pointer"
                            onClick={() => handleImageClick(req.imageUrls, 0)} // Pass the raw imageUrls and start index
                          >
                            <Image
                              src={images[0]} // Display the first image as a preview
                              alt="Generated Image"
                              width={50}
                              height={50}
                              className="rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/no-image.jpg"; // Fallback to default image
                              }}
                              unoptimized
                            />
                            {images.length > 1 && (
                              <span className="ml-2 text-sm text-gray-500">{`+${images.length - 1} more`}</span>
                            )}
                          </div>
                        ) : (
                          "No Image"
                        )}
                      </TableCell>

                      <TableCell>
                        {videos.length > 0 ? (
                          <a
                            href={videos[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            View Video
                          </a>
                        ) : "No Video"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded hover:bg-gray-200">
                              {actionLoading === req.taskId ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                              ) : (
                                <MoreHorizontal />
                              )}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleUpdate(req.taskId, req.mode)}>
                              <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {zoomModalOpen && activeImage && (
        <ZoomModal
          images={activeImage.images} // Parsed images
          currentIndex={activeImage.index} // Start index
          onClose={() => setZoomModalOpen(false)}
        />
      )}
    </div>
  );
}
