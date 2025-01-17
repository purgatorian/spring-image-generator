//app/api/collections/[id]/add-image/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const { imageUrl } = await req.json();

    // ✅ Extract the collection ID from the URL
    const id = req.nextUrl.pathname.split("/")[3];  // Assuming route: /api/collections/[id]/add-image

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

    // ✅ Check if the image already exists in the collection
    const imageExists = collection.images.some((img: {url: string}) => img.url === imageUrl);

    if (imageExists) {
      return NextResponse.json({ message: "Image already exists in the collection." });
    }

    // ✅ Add the image to the collection
    const image = await prisma.image.upsert({
      where: { url: imageUrl },
      update: {},  // No need to update if it exists
      create: { url: imageUrl },
    });

    await prisma.collection.update({
      where: { id },
      data: {
        images: {
          connect: { id: image.id },
        },
      },
    });

    return NextResponse.json({ message: "Image added to the collection." });
  } catch (error) {
    console.error("Error adding image:", error);
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}
