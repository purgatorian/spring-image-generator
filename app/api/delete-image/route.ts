import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  try {
    await del(url, {
      token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,  // Secure token from .env
    });

    return NextResponse.json({ success: true, message: "Image deleted successfully." });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to delete image.", error });
  }
}
