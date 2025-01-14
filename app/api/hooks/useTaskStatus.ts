import { useEffect } from "react";

export const useTaskStatus = (
  taskId: string | null,
  apiEndpoint: string,
  onProgressUpdate: (progress: number) => void,
  onComplete: (images: string[]) => void,
  onError: (error: string) => void
) => {
  useEffect(() => {
    if (!taskId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/generate?apiEndpoint=${apiEndpoint}&task_id=${taskId}`);
        const data = await response.json();
        console.log(data);

        if (data.error) throw new Error(data.error);

        // Corrected task status and progress calculation
        const progress = data.status === "COMPLETED"
          ? 100
          : (data.completed_steps / data.estimated_steps) * 100;

        onProgressUpdate(progress);

        if (data.status === "COMPLETED") {
          onComplete(data.image_urls);
          clearInterval(interval);
        } else if (data.status === "FAILED") {
          onError("Task failed");
          clearInterval(interval);
        }
      } catch (error) {
        onError("Error checking task status");
        console.error("Error checking task status:", error);
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [taskId, apiEndpoint]);
};
