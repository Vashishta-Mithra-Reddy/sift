import { authCheck } from "../utils";
import type { Metadata } from "next";
import { getEchoesAction } from "./actions";
import EchoesPageClient from "./echoes-client";

export const metadata: Metadata = {
    title: "Echoes",
    description: "Track your mastery and review progress over time.",
};

export default async function EchoesPage() {
    await authCheck();
    const echoes = await getEchoesAction();
    return <EchoesPageClient initialEchoes={echoes} />;
}
