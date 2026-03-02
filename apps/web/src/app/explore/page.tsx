import { getPublicSiftsAction } from "../sifts/actions";
import ExplorePageClient from "./explore-client";

export default async function ExplorePage() {
    const sifts = await getPublicSiftsAction();
    return <ExplorePageClient initialSifts={sifts} />;
}
