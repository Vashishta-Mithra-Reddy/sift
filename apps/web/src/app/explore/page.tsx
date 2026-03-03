import { getPublicSiftsAction } from "../sifts/actions";
import ExplorePageClient from "./explore-client";
import { authCheck } from "../utils";

export default async function ExplorePage() {
    await authCheck();
    const sifts = await getPublicSiftsAction();
    return <ExplorePageClient initialSifts={sifts} />;
}
