import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { taskId } = req.body;

  if (!taskId) {
    return res.status(400).json({ error: 'Missing taskId' });
  }

  console.log(`Checking image validity for Task ID: ${taskId}`);

  try {
    // Fetch the image URL from the database
    const task = await fetch(`https://your-database.com/tasks/${taskId}`).then(
      (res) => res.json()
    );
    const imageUrl = task.imageUrls ? JSON.parse(task.imageUrls)[0] : null;

    if (!imageUrl) {
      console.log(`No image found for Task ID: ${taskId}`);
      return res.status(404).json({ error: 'No image found' });
    }

    // Check if the image URL is still valid
    const response = await fetch(imageUrl, { method: 'HEAD' });

    if (!response.ok) {
      console.log(
        `Image for Task ID: ${taskId} is broken. Requesting refresh...`
      );

      // Request a new image from the generation API
      await fetch(`https://your-api.com/generate?task_id=${taskId}`, {
        method: 'POST',
      });

      return res
        .status(200)
        .json({ message: 'Refresh request sent for broken image.' });
    }

    console.log(`Image for Task ID: ${taskId} is still valid.`);
    return res.status(200).json({ message: 'Image is valid.' });
  } catch (error) {
    console.error(`Error checking image for Task ID: ${taskId}`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
