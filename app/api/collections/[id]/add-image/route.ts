import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getAuth(req);
    const { imageUrl } = await req.json();
    const { id } = params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify that the collection belongs to the user
    const collection = await prisma.collection.findUnique({
      where: { id, userId },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found or unauthorized" }, { status: 404 });
    }

    // Add the image to the collection
    await prisma.image.create({
      data: {
        url: imageUrl,
        collectionId: id,
      },
    });

    return NextResponse.json({ message: "Image added to collection." });
  } catch (error) {
    console.error("Error adding image:", error);
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}
