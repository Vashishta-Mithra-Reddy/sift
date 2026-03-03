import { getSiftsAction, getArchivedSiftsAction } from "./actions";
import type { Metadata } from "next";
import { SiftsClient } from "./sifts-client";
import { Suspense } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { authCheck } from "../utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sifts",
  description: "Review and continue your active recall sessions.",
};

export default async function SiftsPage() {
  await authCheck();
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
