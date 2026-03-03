import { auth } from "@sift/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSourcesAction } from "@/app/dashboard/actions";
import Dashboard from "./dashboard";

export const metadata: Metadata = {
  title: "Library",
  description: "Manage your sources and start new learning paths.",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const sources = await getSourcesAction();

  return (
    <div>
      <Dashboard session={session} initialSources={sources} />
    </div>
  );
}
