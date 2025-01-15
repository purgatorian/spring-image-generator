//app/api/collections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

// 📥 Create a new collection or add an image to an existing collection
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const { name, imageUrl } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔍 Check if the collection already exists for the user
    let collection = await prisma.collection.findFirst({
      where: { userId, name },
      include: { images: true },
    });

    if (!collection) {
      // 🆕 Create a new collection with or without an image
      collection = await prisma.collection.create({
        data: {
          userId,
          name,
          images: imageUrl
            ? {
                connectOrCreate: {
                  where: { url: imageUrl },  // ✅ Avoid duplicate images
                  create: { url: imageUrl },
                },
              }
            : undefined,
        },
        include: {
          images: true,
        },
      });
    } else if (imageUrl) {
      // ➕ Check if the image already exists
      let image = await prisma.image.findUnique({
        where: { url: imageUrl },
      });

      // 🖼️ Create the image if it doesn't exist
      if (!image) {
        image = await prisma.image.create({
          data: { url: imageUrl },
        });
      }

      // 🔗 Connect the image to the collection if not already linked
      await prisma.collection.update({
        where: { id: collection.id },
        data: {
          images: {
            connect: { id: image.id },
          },
        },
      });

      // 🔄 Refresh the collection data
      collection = await prisma.collection.findUnique({
        where: { id: collection.id },
        include: { images: true },
      });
    }

    return NextResponse.json({ message: "Image saved to collection.", collection });
  } catch (error) {
    console.error("Error saving to collection:", error);
    return NextResponse.json({ error: "Failed to save collection." }, { status: 500 });
  }
}

// 📤 Get all collections for the user
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔄 Fetch all collections with related images
    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        images: true,  // ✅ Fetch related images
      },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ error: "Failed to fetch collections." }, { status: 500 });
  }
}
