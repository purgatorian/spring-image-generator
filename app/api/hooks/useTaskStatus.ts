import { useEffect } from "react";

interface UseTaskStatusProps {
  taskId: string;
  apiEndpoint: string;
  onProgressUpdate: (progress: number) => void;
  onComplete: (imageUrls: string[]) => void;
  onError: (error: string) => void;
}

export const useTaskStatus = ({
  taskId,
  apiEndpoint,
  onProgressUpdate,
  onComplete,
  onError,
}: UseTaskStatusProps) => {
  useEffect(() => {
    if (!taskId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${apiEndpoint}/task_status/${taskId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_INSTASD_AUTH_TOKEN}`,
          },
        });

        const data = await response.json();

        if (data.status === "COMPLETED") {
          onProgressUpdate(100);
          onComplete(data.image_urls);

          // ✅ Update the database when completed
          await fetch("/api/update-task", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              taskId,
              status: data.status,
              imageUrls: data.image_urls,
              cost: data.cost,
            }),
          });

          clearInterval(interval);
        } else if (data.status === "IN_PROGRESS") {
          const progress = (data.completed_steps / data.estimated_steps) * 100;
          onProgressUpdate(progress);
        }
      } catch (error) {
        console.error("Error checking task status:", error);
        onError("Failed to check task status.");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [taskId, apiEndpoint, onProgressUpdate, onComplete, onError]);  // ✅ Added missing dependencies
};
