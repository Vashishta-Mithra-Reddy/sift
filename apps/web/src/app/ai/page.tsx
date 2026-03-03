import AIPageClient from "./ai-client";

export const metadata = {
  title: "AI Studio",
  description: "Generate courses, quizzes, flashcards and summaries using AI",
};

export default function AIPage() {
  return <AIPageClient />;
}
