import { getEchoesAction } from "./actions";
import EchoesPageClient from "./echoes-client";

export default async function EchoesPage() {
    const echoes = await getEchoesAction();
    return <EchoesPageClient initialEchoes={echoes} />;
}
