"use server";

import { getSifts } from "@sift/auth/actions/sifts";
import { headers } from "next/headers";

export async function getSiftsAction() {
  const headerStore = await headers();
  return await getSifts(headerStore);
}
