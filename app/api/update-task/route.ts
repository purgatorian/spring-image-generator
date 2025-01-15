import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { taskId, status, imageUrls, cost } = await req.json();

    await prisma.request.update({
      where: { taskId },
      data: {
        status,
        imageUrls: JSON.stringify(imageUrls || []),
        cost: cost || 0,
      },
    });

    return NextResponse.json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
