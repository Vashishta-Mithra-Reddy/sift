"use server";

import { NextResponse } from "next/server";
import { processSiftContent } from "@/lib/content-processor";

type IncomingBody = {
  siftId: string;
  content: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IncomingBody;
    const { siftId, content } = body;

    if (!siftId || !content) {
      return NextResponse.json(
        { success: false, error: "Missing siftId or content" },
        { status: 400 }
      );
    }

    const result = await processSiftContent(siftId, content);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Background process failed:", error);
    return NextResponse.json(
      { success: false, error: "Background processing failed" },
      { status: 500 }
    );
  }
}
