import { auth } from "@sift/auth";
import { headers } from "next/headers";

export async function getRequestContext() {
  const headerStore = await headers();
  const session = await auth.api.getSession({
    headers: headerStore,
  });
  return {
    headerStore,
    userId: session?.user?.id ?? "anonymous",
  };
}
