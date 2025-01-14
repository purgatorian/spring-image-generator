import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { apiEndpoint, payload } = await req.json();

    if (!apiEndpoint || !payload) {
      return NextResponse.json({ error: 'Missing apiEndpoint or payload' }, { status: 400 });
    }

    const response = await axios.post(
      `${apiEndpoint}/run_task`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.INSTASD_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { task_id } = response.data;
    return NextResponse.json({ task_id, status: 'CREATED' });
  } catch (error) {
    console.error('Error starting task:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to start task', details: error.response?.data }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiEndpoint = searchParams.get('apiEndpoint');
  const taskId = searchParams.get('task_id');

  if (!apiEndpoint || !taskId) {
    return NextResponse.json({ error: 'Missing apiEndpoint or task_id' }, { status: 400 });
  }

  try {
    const statusResponse = await axios.get(
      `${apiEndpoint}/task_status/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.INSTASD_AUTH_TOKEN}`,
        },
      }
    );

    const { status, image_urls, completed_steps, estimated_steps } = statusResponse.data;
    return NextResponse.json({ status, image_urls, completed_steps, estimated_steps });
  } catch (error) {
    console.error('Error checking task status:', error);
    return NextResponse.json({ error: 'Failed to check task status' }, { status: 500 });
  }
}

export function buildTextModePayload(prompt, negativePrompt, parameters) {
  return {
    inputs: {
      "709b98371964cf3b": {
        title: "Positive Prompt",
        value: prompt,
      },
      "ce7a36588b205151": {
        title: "Negative Prompt",
        value: negativePrompt || "",
      },
      "d9ffb92f3b894f8a": {
        title: "Width",
        value: parameters.width || 1024,
      },
      "ac9be93bce0b142a": {
        title: "Height",
        value: parameters.height || 1024,
      },
      "a05845b5bebf1025": {
        title: "Batch Size",
        value: parameters.batchSize || 1,
      },
      "2930f202ea5a73b5": {
        title: "Tiling",
        value: parameters.tiling ? "enable" : "disable",
      },
      "bdf13c4d02b289e4": {
        title: "InstaSD API Input - Seed",
        value: 862135533978314,
      },
    },
  };
}

