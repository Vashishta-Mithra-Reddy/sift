import SiftSessionPageClient from "./sift-client";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SiftSessionPage({ params }: PageProps) {
    const { id } = await params;
    return <SiftSessionPageClient id={id} />;
}
