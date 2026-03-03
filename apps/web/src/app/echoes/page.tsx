import { authCheck } from "../utils";
import { getEchoesAction } from "./actions";
import EchoesPageClient from "./echoes-client";

export default async function EchoesPage() {
    await authCheck();
    const echoes = await getEchoesAction();
    return <EchoesPageClient initialEchoes={echoes} />;
}
