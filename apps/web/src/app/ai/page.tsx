import { authCheck } from "../utils";
import AIPageClient from "./ai-client";

export const metadata = {
  title: "AI Studio",
  description: "Generate courses, quizzes, flashcards and summaries using AI",
};

export default async function AIPage() {
  await authCheck();
  return <AIPageClient />;
}
