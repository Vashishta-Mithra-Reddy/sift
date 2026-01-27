"use server";

import { createSource, getSources, deleteSource } from "@sift/auth/actions/sources";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { createSift, addQuestions, addSections } from "@sift/auth/actions/sifts";
import { createLearningPath, addSiftToPath, updatePathSummary } from "@sift/auth/actions/learning-paths";
import { processSiftContent } from "@/lib/content-processor";
import { generateQuestionsAction } from "@/app/api/ai/action";
import { after } from "next/server";

export async function uploadSourceAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const text = await file.text(); // Basic text extraction for now
  const headerStore = await headers();

  const sourceId = await createSource({
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

  // Create Sift
  const siftId = await createSift({
      sourceId,
      config: {
          method: "upload" 
      }
  }, headerStore);

  // Trigger Async Processing (Reliable background task for Vercel)
  after(async () => {
      try {
          await processSiftContent(siftId, text);
      } catch (e) {
          console.error("Background processing failed", e);
      }
  });

  return { sourceId, siftId };
}

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

    // 3. Trigger Async Processing (Reliable background task for Vercel)
    // This handles both JSON parsing and AI generation automatically
    after(async () => {
        try {
            await processSiftContent(siftId, content);
        } catch (e) {
            console.error("Background processing failed", e);
        }
    });

    return { sourceId, siftId };
}

export async function createTopicSourceAction(topic: string) {
    const headerStore = await headers();
    
    // 1. Create Source
    const sourceId = await createSource({
        title: topic,
        fileName: "learning-path.txt",
        type: "text",
        content: `Learning Path for: ${topic}`,
        isPasted: true,
        metadata: {
            source: "topic",
            isLearningPath: true
        }
    }, headerStore);

    // 2. Create Sift
    const siftId = await createSift({
        sourceId,
        config: {
            method: "topic",
            isLearningPath: true
        }
    }, headerStore);

    // 3. Trigger Async Processing
    after(async () => {
        try {
            await generateQuestionsAction(siftId, topic, 'learn');
        } catch (e) {
            console.error("Background processing failed", e);
        }
    });

    return { sourceId, siftId };
}

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

export async function createImportedLearningPathAction(title: string, data: any) {
    const headerStore = await headers();

    // Handle new format: { summary, sections: [] } or old format: [sections]
    const sections = Array.isArray(data) ? data : (data.sections || []);
    const summary = !Array.isArray(data) ? data.summary : null;

    // 1. Create the Learning Path Container
    const learningPath = await createLearningPath(title, headerStore);
    
    // 2. Create source for the first module
    const sourceId = await createSource({
        title,
        fileName: "imported-learning-path.json",
        type: "json",
        content: JSON.stringify(data),
        isPasted: true,
        metadata: {
            source: "import",
            isLearningPath: true
        }
    }, headerStore);

    // 3. Create Sift for the first module
    const siftId = await createSift({
        sourceId,
        summary: summary, // Save summary to sift if available
        config: {
            method: "import",
            isLearningPath: true
        }
    }, headerStore);

    // 4. Link Sift to Learning Path
    await addSiftToPath(learningPath.id, siftId, headerStore);

    // Update Path Summary if available
    if (summary) {
        await updatePathSummary(learningPath.id, summary, headerStore);
    }

    // 5. Save sections first to get IDs
    const sectionsToSave = sections.map((s: any, index: number) => ({
        title: s.title,
        content: s.content,
        order: index
    }));
    
    const savedSections = await addSections(siftId, sectionsToSave, headerStore);
    
    // 6. Map saved sections to questions
    const questionsToSave: any[] = [];
    
    sections.forEach((s: any, index: number) => {
        const savedSection = savedSections.find(sec => sec.order === index);
        
        if (savedSection && s.questions && Array.isArray(s.questions)) {
            s.questions.forEach((q: any) => {
                questionsToSave.push({
                    ...q,
                    sectionId: savedSection.id,
                    tags: [title]
                });
            });
        }
    });

    if (questionsToSave.length > 0) {
            await addQuestions(siftId, questionsToSave, headerStore);
    }
    
    return { sourceId, siftId, pathId: learningPath.id };
}

export async function getSourcesAction() {
    const headerStore = await headers();
    return await getSources(headerStore);
}

export async function deleteSourceAction(id: string) {
    const headerStore = await headers();
    await deleteSource(id, headerStore);
    revalidatePath("/dashboard");
    return { success: true };
}
