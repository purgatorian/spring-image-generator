import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

// ✏️ Rename a collection
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getAuth(req);
    const { name } = await req.json();
    const { id } = params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.collection.update({
      where: { id, userId },
      data: { name },
    });

    return NextResponse.json({ message: "Collection renamed successfully." });
  } catch (error) {
    console.error("Error renaming collection:", error);
    return NextResponse.json({ error: "Failed to rename collection." }, { status: 500 });
  }
}

// 🗑️ Delete a collection
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getAuth(req);
    const { id } = params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.collection.delete({
      where: { id, userId },
    });

    return NextResponse.json({ message: "Collection deleted successfully." });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json({ error: "Failed to delete collection." }, { status: 500 });
  }
}
