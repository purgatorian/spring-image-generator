// app/api/collections/[id]/remove-image/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const id = req.nextUrl.pathname.split('/')[3]; // Assuming route: /api/collections/[id]/add-image
    const { imageUrl } = await req.json();
    console.log(id, imageUrl);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id || !imageUrl) {
      return NextResponse.json(
        { error: 'Collection ID and Image URL are required.' },
        { status: 400 }
      );
    }

    // ✅ Verify the collection belongs to the user
    const collection = await prisma.collection.findUnique({
      where: { id, userId },
      include: { images: true },
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found or unauthorized' },
        { status: 404 }
      );
    }

    // ✅ Find the image in the collection
    const image = collection.images.find((img) => img.url === imageUrl);

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found in this collection.' },
        { status: 404 }
      );
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

    return NextResponse.json({ message: 'Image removed from collection.' });
  } catch (error) {
    console.error('Error removing image:', error);
    return NextResponse.json(
      { error: 'Failed to remove image' },
      { status: 500 }
    );
  }
}
