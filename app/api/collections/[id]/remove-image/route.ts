import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getAuth(req);
    const { imageId } = await req.json();
    const { id } = params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the image belongs to the collection and the user
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      include: {
        collection: true,
      },
    });

    if (!image || image.collection.userId !== userId || image.collectionId !== id) {
      return NextResponse.json({ error: "Image not found or unauthorized" }, { status: 404 });
    }

    // Delete the image
    await prisma.image.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ message: "Image removed from collection." });
  } catch (error) {
    console.error("Error removing image:", error);
    return NextResponse.json({ error: "Failed to remove image" }, { status: 500 });
  }
}
