import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

// ✏️ Rename a collection
export async function PUT(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const { name } = await req.json();

    // ✅ Extract the collection ID from the URL
    const id = req.nextUrl.pathname.split("/")[3];
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Ensure the collection belongs to the user
    const collection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!collection || collection.userId !== userId) {
      return NextResponse.json({ error: "Collection not found or unauthorized" }, { status: 404 });
    }

    // ✅ Rename the collection
    const updatedCollection = await prisma.collection.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json({ message: "Collection renamed successfully.", updatedCollection });
  } catch (error) {
    console.error("Error renaming collection:", error);
    return NextResponse.json({ error: "Failed to rename collection." }, { status: 500 });
  }
}

// 🗑️ Delete a collection
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    // ✅ Extract the collection ID from the URL
    const id = req.nextUrl.pathname.split("/")[3];

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Check if the collection exists and belongs to the user
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!collection || collection.userId !== userId) {
      return NextResponse.json({ error: "Collection not found or unauthorized" }, { status: 404 });
    }

    // 🔗 Disconnect images before deleting the collection
    await prisma.collection.update({
      where: { id },
      data: {
        images: {
          disconnect: collection.images.map((img) => ({ id: img.id })),
        },
      },
    });

    // 🗑️ Delete the collection
    await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Collection deleted successfully." });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json({ error: "Failed to delete collection." }, { status: 500 });
  }
}

// 📦 Get a specific collection with its images
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    // ✅ Extract the collection ID from the URL
    const id = req.nextUrl.pathname.split("/")[3];
    if (!id) {
      return NextResponse.json({ error: "Invalid collection ID." }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Fetch the collection with its images
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        images: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });    

    if (!collection || collection.userId !== userId) {
      return NextResponse.json({ error: "Collection not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json({ error: "Failed to fetch collection." }, { status: 500 });
  }
}
