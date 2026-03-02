"use server";

import { getSifts, getPublicSifts, getArchivedSifts } from "@sift/auth/actions/sifts";
import { headers } from "next/headers";

export async function getSiftsAction() {
  const headerStore = await headers();
  return await getSifts(headerStore);
}

export async function getArchivedSiftsAction() {
  const headerStore = await headers();
  return await getArchivedSifts(headerStore);
}

export async function getPublicSiftsAction() {
  const headerStore = await headers();
  return await getPublicSifts(headerStore);
}
