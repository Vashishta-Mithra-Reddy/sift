import SiftSessionReviewPageClient from "./session-client";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SiftSessionReviewPage({ params }: PageProps) {
    const { id } = await params;
    return <SiftSessionReviewPageClient id={id} />;
}
