//app/api/generate/route.ts
"use server"
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      console.error('❌ Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { apiEndpoint, payload } = await req.json();

    if (!apiEndpoint || !payload) {
      console.error('❌ Missing apiEndpoint or payload:', { apiEndpoint, payload });
      return NextResponse.json({ error: 'Missing apiEndpoint or payload' }, { status: 400 });
    }

    // 🟢 Step 1: Test API Call
    let task_id;
    try {
      const response = await axios.post(`${apiEndpoint}/run_task`, payload, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_INSTASD_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      task_id = response.data.task_id;
    } catch (apiError: unknown) {
      if (axios.isAxiosError(apiError)) {
        console.error("❌ Error in API call to InstaSD:", apiError.response?.data || apiError.message);
        return NextResponse.json({ 
          error: 'Failed API call to InstaSD', 
          details: apiError.response?.data || apiError.message 
        }, { status: 500 });
      } else {
        console.error("❌ Unknown error:", apiError);
        return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
      }
    }

    // 🟢 Step 2: Test Database Write
    try {
      await prisma.request.create({
        data: {
          userId,
          taskId: task_id,
          status: 'CREATED',
          cost: 0,
        },
      });
    } catch (dbError: unknown) {
      if (dbError instanceof Error) {
        console.error("❌ Error writing to the database:", dbError.message);
        return NextResponse.json({ 
          error: 'Failed to write to the database', 
          details: dbError.message 
        }, { status: 500 });
      } else {
        console.error("❌ Unknown database error:", dbError);
        return NextResponse.json({ error: 'Unknown database error' }, { status: 500 });
      }
    }

    return NextResponse.json({ task_id, status: 'CREATED' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ General error:', error.message);
      return NextResponse.json({ 
        error: 'Failed to start task', 
        details: error.message 
      }, { status: 500 });
    } else {
      console.error('❌ Unknown error:', error);
      return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
    }
  }
}

// GET: Check task status and update the database with the results
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
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_INSTASD_AUTH_TOKEN}`,
        },
      }
    );

    const { status, image_urls, video_urls, completed_steps, estimated_steps, cost } = statusResponse.data;

    // Update the task in the database
    await prisma.request.update({
      where: { taskId },
      data: {
        status,
        imageUrls: JSON.stringify(image_urls || []),
        videoUrls: JSON.stringify(video_urls || []),
        cost: cost || 0,
      },
    });

    return NextResponse.json({ status, image_urls, video_urls, completed_steps, estimated_steps });
  } catch (error) {
    console.error('Error checking task status:', error);
    return NextResponse.json({ error: 'Failed to check task status' }, { status: 500 });
  }
}