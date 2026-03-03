import { authCheck } from "../utils";
import type { Metadata } from "next";
import { getLearningPathsAction } from "./actions";
import LearningPathsPageClient from "./learn-page-client";

export const metadata: Metadata = {
  title: "Learning Paths",
  description: "Your AI-generated courses and structured learning paths.",
};

export default async function LearningPathsPage() {
    await authCheck();
    const paths = await getLearningPathsAction();
    return <LearningPathsPageClient initialPaths={paths} />;
}
