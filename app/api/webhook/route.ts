import { ComfyDeploy } from "comfydeploy";
import { NextResponse } from "next/server";

const cd = new ComfyDeploy();
const runStatus = new Map(); // Temporary in-memory store for statuses

export async function POST(request: Request) {
  const data = await cd.validateWebhook({ request });

  const { status, runId, outputs, liveStatus, progress } = data;
  console.log("Webhook data:", data);
  // Update in-memory status
  runStatus.set(runId, { status, outputs });

  // Log the progress (for debugging)
  console.log(`RunID: ${runId}, Status: ${status}, Outputs:`, outputs);

  // Return success to ComfyDeploy
  return NextResponse.json({ message: "success" }, { status: 200 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");

  return new Response(
    new ReadableStream({
      start(controller) {
        const interval = setInterval(() => {
          const status = runStatus.get(runId);

          if (status) {
            controller.enqueue(`data: ${JSON.stringify(status)}\n\n`);

            if (status.status === "success" || status.status === "failed") {
              clearInterval(interval);
              runStatus.delete(runId); // Clean up when done
              controller.close();
            }
          }
        }, 1000);
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    }
  );
}
