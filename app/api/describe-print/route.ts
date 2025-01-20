import { NextRequest, NextResponse } from "next/server";
import { fetchOpenAIDescription } from "@/lib/openaiClient"; // Adjust the path to match your project structure

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl } = body;
    console.log("imageUrl", imageUrl);
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const description = await fetchOpenAIDescription(imageUrl);
    return NextResponse.json({ description });
  } catch (error) {
    console.error("Error in describe-print API:", error);
    return NextResponse.json(
      { error: "Failed to process the image" },
      { status: 500 }
    );
  }
}
