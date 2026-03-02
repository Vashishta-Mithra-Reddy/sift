import { auth } from "@sift/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SettingsPageClient from "./settings-client";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  return <SettingsPageClient session={session} />;
}
