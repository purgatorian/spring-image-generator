'use client';

import { useEffect, useState } from 'react';
import Filters from '@/components/ui/Filters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import ZoomModal from '@/components/ZoomModal';
import { Loader2, MoreHorizontal, RefreshCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface Request {
  id: string;
  taskId: string;
  createdAt: string;
  cost: number;
  status: string;
  imageUrls: string;
  videoUrls: string;
  mode: string;
}

interface ActiveImage {
  images: { url: string }[];
  index: number;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<ActiveImage | null>(null);

  // 🔹 Filter States
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: undefined,
    to: undefined,
  });
  const [costRange, setCostRange] = useState([0, 1]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMode, setFilterMode] = useState('ALL');
  const [filterHasImage, setFilterHasImage] = useState(false);
  const [filterHasVideo, setFilterHasVideo] = useState(false);

  // 🔹 Fetch Data
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/get-requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Filtering Logic
  const filteredRequests = requests.filter((req) => {
    const costFloat = req.cost / 1000000;
    const createdAt = new Date(req.createdAt);

    // Date Range
    if (dateRange.from && createdAt < dateRange.from) return false;
    if (dateRange.to && createdAt > dateRange.to) return false;

    // Cost Range
    if (costFloat < costRange[0] || costFloat > costRange[1]) return false;

    // Status & Mode
    if (filterStatus !== 'ALL' && req.status !== filterStatus) return false;
    if (filterMode !== 'ALL' && req.mode !== filterMode) return false;

    // Image & Video Existence
    const images = JSON.parse(req.imageUrls || '[]');
    if (filterHasImage && images.length === 0) return false;

    const videos = JSON.parse(req.videoUrls || '[]');
    if (filterHasVideo && videos.length === 0) return false;

    return true;
  });

  // 🔹 Handle Image Click for ZoomModal
  const handleImageClick = (imageUrls: string, index: number) => {
    const images = JSON.parse(imageUrls || '[]').map((url: string) => ({
      url,
    }));

    if (images.length > 0) {
      setActiveImage({ images, index });
      setZoomModalOpen(true);
    }
  };

  // 🔹 Handle Refresh Action
  const handleUpdate = async (taskId: string, mode: string) => {
    setActionLoading(taskId); // Show loading for this task
    try {
      const response = await fetch(
        `/api/generate?task_id=${taskId}&apiMode=${mode}`
      );

      if (!response.ok) {
        throw new Error('Failed to refresh data.');
      }

      await fetchRequests(); // Refresh UI
    } catch (error) {
      console.error('Error updating request:', error);
    } finally {
      setActionLoading(null); // Hide loading
    }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Filters Section */}
      <Filters
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        dateRange={dateRange}
        setDateRange={setDateRange}
        costRange={costRange}
        setCostRange={setCostRange}
        filterHasImage={filterHasImage}
        setFilterHasImage={setFilterHasImage}
        filterHasVideo={filterHasVideo}
        setFilterHasVideo={setFilterHasVideo}
      />

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="animate-spin w-6 h-6 mr-2" />
              Loading Requests...
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
                {filteredRequests.map((req) => {
                  const images = JSON.parse(req.imageUrls || '[]');
                  const videos = JSON.parse(req.videoUrls || '[]');
                  return (
                    <TableRow key={req.id}>
                      <TableCell>
                        {new Date(req.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>${(req.cost / 1000000).toFixed(6)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            req.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : req.status === 'IN_PROGRESS'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{req.mode}</TableCell>
                      <TableCell>
                        {images.length > 0 ? (
                          <div
                            className="cursor-pointer"
                            onClick={() => handleImageClick(req.imageUrls, 0)}
                          >
                            <Image
                              src={images[0]}
                              alt="Generated Image"
                              width={50}
                              height={50}
                              className="rounded"
                            />
                          </div>
                        ) : (
                          <span className="text-gray-400">No Image</span>
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
                        ) : (
                          <span className="text-gray-400">No Video</span>
                        )}
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
                            <DropdownMenuItem
                              onClick={() => handleUpdate(req.taskId, req.mode)}
                            >
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
          images={activeImage.images}
          currentIndex={activeImage.index}
          onClose={() => setZoomModalOpen(false)}
        />
      )}
    </div>
  );
}
