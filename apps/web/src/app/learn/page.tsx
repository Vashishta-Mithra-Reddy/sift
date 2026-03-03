import { authCheck } from "../utils";
import { getLearningPathsAction } from "./actions";
import LearningPathsPageClient from "./learn-page-client";

export default async function LearningPathsPage() {
    await authCheck();
    const paths = await getLearningPathsAction();
    return <LearningPathsPageClient initialPaths={paths} />;
}
