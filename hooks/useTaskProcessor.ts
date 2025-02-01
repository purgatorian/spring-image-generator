// useTaskProcessor.ts
import { useState, useEffect } from 'react';

interface TaskResult {
  generatedImages: string[];
  progress: number;
  status: string;
  isGenerating: boolean;
  startTask: <T>(apiMode: string, payload: T) => void;
}

export const useTaskProcessor = (): TaskResult => {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [apiMode, setApiMode] = useState<string | null>(null);
  const [status, setStatus] = useState('Waiting for generation...');
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Polling API to check the status
  useEffect(() => {
    if (!taskId || !apiMode) return;

    setIsGenerating(true);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/generate?task_id=${taskId}&apiMode=${apiMode}`
        );
        if (!res.ok) throw new Error('Failed to fetch task status');

        const data = await res.json();

        if (data.status === 'failed') {
          setStatus('Generation failed');
          setIsGenerating(false);
          clearInterval(interval);
          return;
        }

        setStatus(
          data.status === 'IN_QUEUE'
            ? 'Queued for processing'
            : data.status === 'EXECUTING'
              ? 'Generating images...' // Updated wording
              : data.status || 'Processing...'
        );
        setProgress(data.progress || 0);

        if (data.status === 'COMPLETED' && data.image_urls) {
          setGeneratedImages(data.image_urls);
          setIsGenerating(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error fetching task status:', error);
        setIsGenerating(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [taskId, apiMode]);

  // Function to start a new task
  const startTask = async <T>(apiMode: string, payload: T) => {
    setApiMode(apiMode);
    setStatus('Queuing generation...');
    setProgress(0);
    setGeneratedImages([]);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiMode, payload }),
      });

      if (!res.ok) {
        throw new Error('Failed to queue generation');
      }

      const data = await res.json();
      setTaskId(data.task_id);
      setStatus('Queued');
    } catch (error) {
      console.error('Error queuing task:', error);
      setStatus('Error starting generation');
      setIsGenerating(false);
    }
  };

  return { generatedImages, progress, status, isGenerating, startTask };
};
