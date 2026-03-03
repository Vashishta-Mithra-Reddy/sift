import { auth } from "@sift/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function authCheck() {
    const session = await auth.api.getSession({
        headers: await headers(),
      });
    
    if (!session?.user) {
        redirect("/login");
    }
}
