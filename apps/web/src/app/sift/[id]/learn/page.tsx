import LearningPathPageClient from "./learn-client";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function LearningPathPage({ params }: PageProps) {
    const { id } = await params;
    return <LearningPathPageClient id={id} />;
}
