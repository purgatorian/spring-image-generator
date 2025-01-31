//app/api/upload-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const folder = (formData.get('folder') as string) || 'uploads'; // Default folder

  if (!file) {
    return NextResponse.json(
      { success: false, message: 'No file uploaded.' },
      { status: 400 }
    );
  }

  try {
    // Generate a unique path (e.g., "uploads/user-123/image.png")
    const filePath = `${folder}/${file.name}`;

    const blob = await put(filePath, file, {
      access: 'public',
      token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Upload failed.',
      error,
    });
  }
}
