"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import ZoomModal from "@/components/ZoomModal";
import { Loader2 } from "lucide-react";

interface Request {
  id: string;
  createdAt: string;
  cost: number;
  status: string;
  imageUrls: string;
  videoUrls: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
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

    fetchRequests();
  }, []);

  const formatCost = (cost: number) => `$${(cost / 1000000).toFixed(6)}`;

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

  const handleImageClick = (url: string) => {
    setActiveImage(url);
    setZoomModalOpen(true);
  };

  return (
    <div className="ml-4 p-4">  {/* ✅ Added left margin for spacing */}
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
                  <TableHead>Image</TableHead>
                  <TableHead>Video</TableHead>
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
                        <Badge className={getStatusColor(req.status)}>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {images.length > 0 ? (
                          <Image
                            src={images[0]}
                            alt="Generated Image"
                            width={50}
                            height={50}
                            className="rounded cursor-pointer"
                            onClick={() => handleImageClick(images[0])}  // ✅ Open ZoomModal on click
                          />
                        ) : (
                          "No Image"
                        )}
                      </TableCell>
                      <TableCell>
                        {videos.length > 0 ? (
                          <a
                            href={videos[0]}
                            target="_blank"  // ✅ Open video in new tab
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            View Video
                          </a>
                        ) : (
                          "No Video"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ✅ ZoomModal for Images */}
      {zoomModalOpen && activeImage && (
        <ZoomModal
          images={[{ url: activeImage }]}
          currentIndex={0}
          onClose={() => setZoomModalOpen(false)}
        />
      )}
    </div>
  );
}
