import { getSiftsAction, getArchivedSiftsAction } from "./actions";
import { SiftsClient } from "./sifts-client";
import { Suspense } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

export const dynamic = "force-dynamic";

export default async function SiftsPage() {
  const [active, archived] = await Promise.all([
    getSiftsAction(),
    getArchivedSiftsAction()
  ]);

  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Loading03Icon} className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <SiftsClient initialSifts={active} initialArchivedSifts={archived} />
    </Suspense>
  );
}
