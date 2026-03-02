import { redirect } from "next/navigation";
import { getLearningPathAction } from "../actions";
import LearningPathDetailsClient from "./learn-client";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function LearningPathDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const path = await getLearningPathAction(id);

    if (!path) {
        redirect("/learn");
    }

    return <LearningPathDetailsClient path={path} />;
}
