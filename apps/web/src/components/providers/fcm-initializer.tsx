"use client";

import { useFCM } from "@/hooks/use-fcm";

export function FCMInitializer() {
  useFCM();
  return null;
}
