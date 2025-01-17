import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const { imageUrl } = await req.json();

    // ✅ Extract the collection ID from the URL
    const id = req.nextUrl.pathname.split("/")[3];  // Assuming the route: /api/collections/[id]/remove-image

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
    }

    // ✅ Verify the collection belongs to the user
    const collection = await prisma.collection.findUnique({
      where: { id, userId },
      include: { images: true },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found or unauthorized" }, { status: 404 });
    }

    // ✅ Find the image in the collection
    const image = collection.images.find((img: { url: string }) => img.url === imageUrl);

    if (!image) {
      return NextResponse.json({ error: "Image not found in this collection." }, { status: 404 });
    }

    // ✅ Disconnect the image from the collection (don't delete it globally)
    await prisma.collection.update({
      where: { id },
      data: {
        images: {
          disconnect: { id: image.id },
        },
      },
    });

    return NextResponse.json({ message: "Image removed from collection." });
  } catch (error) {
    console.error("Error removing image:", error);
    return NextResponse.json({ error: "Failed to remove image" }, { status: 500 });
  }
}
