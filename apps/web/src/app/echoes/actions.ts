"use server";

import { getEchoes } from "@sift/auth/actions/echoes";
import { getRequestContext } from "@/lib/cache";

export async function getEchoesAction() {
  const { headerStore } = await getRequestContext();
  return getEchoes(undefined, headerStore);
}
