"use server";

import { updateUserDetails } from "@sift/auth/actions/users";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(data: { name: string }) {
  const requestHeaders = await headers();
  
  await updateUserDetails(data, requestHeaders);

  revalidatePath("/settings");
  revalidatePath("/", "layout");
}