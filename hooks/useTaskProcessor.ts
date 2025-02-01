import { useState, useEffect } from 'react';

interface TaskResult {
  generatedImages: string[];
  progress: number;
  status: string;
  isGenerating: boolean;
  error: string | null; // ✅ Added error state
  startTask: <T>(apiMode: string, payload: T) => void;
}

export const useTaskProcessor = (): TaskResult => {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [apiMode, setApiMode] = useState<string | null>(null);
  const [status, setStatus] = useState('Waiting for generation...');
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null); // ✅ Added error state

  // Polling API to check the status
  useEffect(() => {
    if (!taskId || !apiMode) return;

    setIsGenerating(true);
    setError(null); // Reset error on new task

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
          setError('Generation failed. Please try again.'); // ✅ Set error message
          clearInterval(interval);
          return;
        }

        setStatus(
          data.status === 'IN_QUEUE'
            ? 'Queued for processing'
            : data.status === 'EXECUTING'
              ? 'Generating images...'
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
        setError('Error fetching task status. Please try again.'); // ✅ Set error message
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
    setError(null); // ✅ Reset error on new task

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
      setError(
        'Error starting generation. Please check your input and try again.'
      ); // ✅ Set error message
    }
  };

  return { generatedImages, progress, status, isGenerating, error, startTask };
};
