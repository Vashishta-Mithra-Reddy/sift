import SiftPlayPageClient from "./play-client";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SiftPlayPage({ params }: PageProps) {
    const { id } = await params;
    return <SiftPlayPageClient id={id} />;
}
