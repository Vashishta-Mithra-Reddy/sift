import TakeawaysPageClient from "./takeaways-client";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TakeawaysPage({ params }: PageProps) {
    const { id } = await params;
    return <TakeawaysPageClient id={id} />;
}
