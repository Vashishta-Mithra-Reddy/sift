import { getPublicSiftsAction } from "../sifts/actions";
import type { Metadata } from "next";
import ExplorePageClient from "./explore-client";
import { authCheck } from "../utils";

export const metadata: Metadata = {
  title: "Explore",
  description: "Browse public learning paths and community sifts.",
};

export default async function ExplorePage() {
    await authCheck();
    const sifts = await getPublicSiftsAction();
    return <ExplorePageClient initialSifts={sifts} />;
}
