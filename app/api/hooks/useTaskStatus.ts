import { useEffect } from "react";

export const useTaskStatus = (taskId, apiEndpoint, onProgressUpdate, onComplete, onError) => {
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

          // ✅ Call the new API route to update the DB
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
  }, [taskId, apiEndpoint]);
};
