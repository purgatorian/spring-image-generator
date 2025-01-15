// /api/collections/[id]/add-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { imageUrl } = await req.json();

    await prisma.collection.update({
      where: { id: params.id },
      data: {
        images: { push: imageUrl },
      },
    });

    return NextResponse.json({ message: "Image added to collection." });
  } catch (error) {
    console.error("Error adding image:", error);
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}
