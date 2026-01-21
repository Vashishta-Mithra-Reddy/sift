import { auth } from "@sift/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSourcesAction } from "@/app/dashboard/actions";

import { authClient } from "@/lib/auth-client";

import Dashboard from "./dashboard";

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
      {/* <p>Welcome {session.user.name}</p> */}
      <Dashboard session={session} initialSources={sources} />
    </div>
  );
}
