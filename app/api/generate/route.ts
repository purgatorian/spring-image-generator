// app/api/generate/route.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { instaSDConfig } from "@/config/instaSD";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      console.error("❌ Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Grab apiMode, payload from client
    const { apiMode, payload } = await req.json();

    // Look up the correct endpoint + token
    const { endpoint, authToken } = instaSDConfig[apiMode as "text" | "image"] || {};

    if (!endpoint || !payload) {
      console.error("❌ Missing endpoint or payload:", { endpoint, payload });
      return NextResponse.json(
        { error: "Missing endpoint or payload" },
        { status: 400 }
      );
    }

    // 1. Call InstaSD API to run the task
    let task_id: string;    
    try {
      const response =   await axios.post(`${endpoint}/run_task`, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      task_id = response.data.task_id;
    } catch (apiError: unknown) {
      if (axios.isAxiosError(apiError)) {
        console.error("❌ Error in API call to InstaSD:", apiError.response?.data || apiError.message);
        return NextResponse.json(
          {
            error: "Failed API call to InstaSD",
            details: apiError.response?.data || apiError.message,
          },
          { status: 500 }
        );
      } else {
        console.error("❌ Unknown error:", apiError);
        return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
      }
    }

    // 2. Write to DB
    try {
      await prisma.request.create({
        data: {
          userId,
          taskId: task_id,
          status: "CREATED",
          cost: 0, // might be updated later
        },
      });
    } catch (dbError: unknown) {
      if (dbError instanceof Error) {
        console.error("❌ Error writing to DB:", dbError.message);
        return NextResponse.json(
          {
            error: "Failed to write to the database",
            details: dbError.message,
          },
          { status: 500 }
        );
      } else {
        console.error("❌ Unknown DB error:", dbError);
        return NextResponse.json({ error: "Unknown DB error" }, { status: 500 });
      }
    }

    return NextResponse.json({ task_id, status: "CREATED" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ General error:", error.message);
      return NextResponse.json(
        {
          error: "Failed to start task",
          details: error.message,
        },
        { status: 500 }
      );
    } else {
      console.error("❌ Unknown error:", error);
      return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
    }
  }
}

// GET route: check the status, return progress, and update the DB
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const apiMode = searchParams.get("apiMode");
    const taskId = searchParams.get("task_id");
    console.log("Checking task status:", { apiMode, taskId });
    if (!apiMode || !taskId) {
      return NextResponse.json({ error: "Missing apiMode or task_id" }, { status: 400 });
    }
    const { endpoint, authToken } = instaSDConfig[apiMode as "text" | "image"] || {};
    if (!endpoint) {
      return NextResponse.json({ error: "Unknown mode" }, { status: 400 });
    }

    // 1. Call InstaSD to check the status
    const statusResponse = await axios.get(`${endpoint}/task_status/${taskId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const {
      status,
      image_urls,
      video_urls,
      estimated_steps,
      completed_steps,
      cost,
    } = statusResponse.data;

    console.log(completed_steps)

    // 2. Update the DB with the new status
    await prisma.request.update({
      where: { taskId },
      data: {
        status,
        imageUrls: JSON.stringify(image_urls || []),
        videoUrls: JSON.stringify(video_urls || []),
        cost: cost || 0,
      },
    });

    // 3. Compute progress in percentage
    let progress = 0;
    if (status != "COMPLETED") {
      progress = Math.floor((completed_steps / estimated_steps) * 100);
    } else if (status === "COMPLETED") {
      progress = 100;
    }

    // 4. Return everything needed by the client
    return NextResponse.json({
      taskId,
      status,
      progress,
      image_urls,
      video_urls,
      estimated_steps,
      completed_steps,
      cost,
    });
  } catch (error) {
    console.error("Error checking task status:", error);
    return NextResponse.json({ error: "Failed to check task status" }, { status: 500 });
  }
}
