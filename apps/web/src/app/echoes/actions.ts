"use server";

import { getEchoes } from "@sift/auth/actions/echoes";
import { headers } from "next/headers";

export async function getEchoesAction() {
  const headerStore = await headers();
  return await getEchoes(undefined, headerStore);
}
