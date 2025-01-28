import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Aggregate all unique images from all collections belonging to the user
    const images = await prisma.image.findMany({
      where: {
        collections: {
          some: { userId },
        },
      },
      distinct: ["url"], // Ensure unique URLs
      select: { id: true, url: true }, // Return only necessary fields
    });

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error fetching all images:", error);
    return NextResponse.json({ error: "Failed to fetch all images." }, { status: 500 });
  }
}
