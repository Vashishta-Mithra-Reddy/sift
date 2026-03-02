import { getLearningPathsAction } from "./actions";
import LearningPathsPageClient from "./learn-page-client";

export default async function LearningPathsPage() {
    const paths = await getLearningPathsAction();
    return <LearningPathsPageClient initialPaths={paths} />;
}
