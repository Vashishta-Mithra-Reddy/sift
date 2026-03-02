import FlashcardsPageClient from "./flashcards-client";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function FlashcardsPage({ params }: PageProps) {
    const { id } = await params;
    return <FlashcardsPageClient id={id} />;
}
