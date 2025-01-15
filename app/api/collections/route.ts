import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

// 📥 Create a new collection
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const { name, imageUrl } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let collection = await prisma.collection.findFirst({
      where: { userId, name },
    });

    if (!collection) {
      collection = await prisma.collection.create({
        data: {
          userId,
          name,
          images: imageUrl ? [imageUrl] : [],
        },
      });
    } else if (imageUrl) {
      await prisma.collection.update({
        where: { id: collection.id },
        data: {
          images: { push: imageUrl },
        },
      });
    }

    return NextResponse.json({ message: "Image saved to collection." });
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

    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ error: "Failed to fetch collections." }, { status: 500 });
  }
}

