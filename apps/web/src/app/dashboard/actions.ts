"use server";

import { createSource, getSources, deleteSource } from "@sift/auth/actions/sources";
import { headers } from "next/headers";

export async function uploadSourceAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const text = await file.text(); // Basic text extraction for now
  const headerStore = await headers();

  await createSource({
    title: file.name,
    fileName: file.name,
    type: "text", // Auto-detect later
    content: text,
    isPasted: false,
    metadata: {
        size: file.size,
        type: file.type
    }
  }, headerStore);
}

import { processSiftContent } from "@/lib/content-processor";

export async function createTextSourceAction(title: string, content: string) {
    const headerStore = await headers();
    
    // 1. Create Source
    const sourceId = await createSource({
        title,
        fileName: "pasted-content.txt",
        type: "text",
        content,
        isPasted: true,
        metadata: {
            source: "paste"
        }
    }, headerStore);

    // 2. Create Sift
    const siftId = await createSift({
        sourceId,
        config: {
            method: "paste" 
        }
    }, headerStore);

    // 3. Trigger Async Processing (Fire and Forget)
    // This handles both JSON parsing and AI generation automatically
    (async () => {
        try {
            await processSiftContent(siftId, content);
        } catch (e) {
            console.error("Background processing failed", e);
        }
    })();

    return { sourceId, siftId };
}

import { createSift, addQuestions } from "@sift/auth/actions/sifts";

export async function createImportedSourceAction(title: string, questions: any[]) {
    const headerStore = await headers();
    
    // Create source
    const sourceId = await createSource({
        title,
        fileName: "imported-questions.json",
        type: "json",
        content: JSON.stringify(questions),
        isPasted: true,
        metadata: {
            source: "import"
        }
    }, headerStore);

    // Create Sift
    const siftId = await createSift({
        sourceId,
        config: {
            method: "import"
        }
    }, headerStore);

    // Add Questions
    await addQuestions(siftId, questions, headerStore);
    
    return { sourceId, siftId };
}

export async function getSourcesAction() {
    const headerStore = await headers();
    return await getSources(headerStore);
}

export async function deleteSourceAction(id: string) {
    const headerStore = await headers();
    return await deleteSource(id, headerStore);
}
