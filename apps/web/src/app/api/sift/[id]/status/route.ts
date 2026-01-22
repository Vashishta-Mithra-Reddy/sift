
import { getSift } from "@sift/auth/actions/sifts";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { eventBus } from "@/lib/events";

export const runtime = "nodejs"; // SSE requires nodejs runtime usually, or edge with limitations

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const headerStore = await headers();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const send = (data: any) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          isClosed = true;
        }
      };

      const close = () => {
        if (isClosed) return;
        isClosed = true;
        controller.close();
      };

      // Listener function
      const onReady = (data: { count: number }) => {
        send({ status: "ready", count: data.count });
        close();
      };

      // 1. Subscribe FIRST to avoid race conditions (event firing during DB check)
      eventBus.once(`sift-ready-${id}`, onReady);

      // 2. Check DB status (in case it was already ready before we subscribed)
      try {
        const sift = await getSift(id, headerStore);
        if (sift && sift.questions && sift.questions.length > 0) {
          // If ready, cleanup listener and finish
          eventBus.off(`sift-ready-${id}`, onReady);
          send({ status: "ready", count: sift.questions.length });
          close();
          return;
        }
      } catch (e) {
        console.error("SSE Error checking sift:", e);
      }

      // 3. Fallback Polling (Safety net for missed events or serverless environments)
      const interval = setInterval(async () => {
        if (isClosed) {
          clearInterval(interval);
          return;
        }
        try {
           const sift = await getSift(id, headerStore);
           if (sift && sift.questions && sift.questions.length > 0) {
             eventBus.off(`sift-ready-${id}`, onReady);
             send({ status: "ready", count: sift.questions.length });
             clearInterval(interval);
             close();
           }
        } catch (e) {
           // Ignore errors during poll
        }
      }, 3000); // Check every 3 seconds as backup

      // 4. Clean up on client disconnect
      request.signal.addEventListener("abort", () => {
        eventBus.off(`sift-ready-${id}`, onReady);
        clearInterval(interval);
        close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
