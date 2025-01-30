import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { put, list } from '@vercel/blob'; // Import `list` to search for files
import path from 'path';
import { URL } from 'url';
//import { prisma } from '@/lib/prisma'; // ✅ Now using Prisma

const extractFileNameFromUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    return path.basename(parsedUrl.pathname);
  } catch {
    return `image_${Date.now()}.jpg`;
  }
};

const findExistingBlobUrl = async (
  userId: string,
  fileName: string
): Promise<string | null> => {
  try {
    const files = await list({
      prefix: `${userId}/`,
      token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN, // ✅ Include token for authentication
    }); // Get all files in the user's folder
    const matchedFile = files.blobs.find((file) =>
      file.pathname.endsWith(fileName)
    );
    return matchedFile ? matchedFile.url : null;
  } catch (error) {
    console.error('Error searching for existing image in Vercel Blob:', error);
    return null;
  }
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const { imageUrl } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const fileName = extractFileNameFromUrl(imageUrl);
    const existingBlobUrl = await findExistingBlobUrl(userId, fileName);

    if (existingBlobUrl) {
      return NextResponse.json({ success: true, url: existingBlobUrl }); // ✅ Use the found Blob URL
    }

    // ✅ If not found, fetch and upload the image to Vercel Blob
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image.');
    const blob = await response.blob();
    const uploadPath = `${userId}/${fileName}`;
    const uploadedImage = await put(uploadPath, blob, {
      access: 'public',
      token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ success: true, url: uploadedImage.url });
  } catch (error) {
    console.error('Error in verify-image:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to verify or upload image',
    });
  }
}
