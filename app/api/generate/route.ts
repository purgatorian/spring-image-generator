import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { mode, textPrompt, negativePrompt, uploadedImages, uploadedImageUrl, parameters } = body;

    // Construct the payload dynamically based on the mode
    let inputs;
    if (mode === "text") {
      // Workflow for text-based generation
      inputs = {
        positive_input: textPrompt,
        negative_input: negativePrompt || "",
        width: parseInt(parameters.resolution.split("x")[0]),
        height: parseInt(parameters.resolution.split("x")[1]),
        tiling: parameters.tiling,
        batch_size: parameters.batchSize,
        denoise: parameters.denoise,
      };
    } else if (mode === "image") {
      // Workflow for image-based generation
      inputs = {
        //images: uploadedImages || [],
        //image_url: uploadedImageUrl || "",
        width: parseInt(parameters.resolution.split("x")[0]),
        height: parseInt(parameters.resolution.split("x")[1]),
        tiling: parameters.tiling,
        batch_size: parameters.batchSize,
        denoise: parameters.denoise,
      };
    }
    debugger;
    // Make the fetch request to ComfyDeploy
    const response = await fetch("https://api.comfydeploy.com/api/run/deployment/queue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.COMFY_DEPLOY_API_KEY}`,
      },
      body: JSON.stringify({
        deployment_id: "897e8d16-b4d1-4832-a76d-e69edf80e4e8",
        webhook: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`, // Optional webhook for status updates
        inputs,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("ComfyDeploy API error:", error);
      return NextResponse.json({ error: error.message || "Failed to queue deployment" }, { status: response.status });
    }

    const result = await response.json();
    console.log("ComfyDeploy response:", result);

    // Return the queued run ID to the frontend
    return NextResponse.json({ success: true, runId: result.run_id });
    return NextResponse.json({ success: true, runId: 1 });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
