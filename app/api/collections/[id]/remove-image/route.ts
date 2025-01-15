import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { imageUrl } = await req.json();

    // ✅ Correctly remove the image URL from the collection
    await prisma.collection.update({
        where: { id: params.id },
        data: {
          images: {
            set: (await prisma.collection.findUnique({
              where: { id: params.id },
            }))!.images.filter((url) => url !== imageUrl),
          },
        },
      });

    return NextResponse.json({ message: "Image removed from collection." });
  } catch (error) {
    console.error("Error removing image:", error);
    return NextResponse.json({ error: "Failed to remove image" }, { status: 500 });
  }
}
