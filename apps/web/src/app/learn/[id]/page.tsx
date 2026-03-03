import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getLearningPathAction } from "../actions";
import LearningPathDetailsClient from "./learn-client";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const path = await getLearningPathAction(id);

    if (!path) {
        return {
            title: "Learning Path",
            description: "Learning path details and progress."
        };
    }

    return {
        title: path.title || "Learning Path",
        description: path.summary || "Learning path details and progress."
    };
}

export default async function LearningPathDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const path = await getLearningPathAction(id);

    if (!path) {
        redirect("/learn");
    }

    return <LearningPathDetailsClient path={path} />;
}
