"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "../ui/sonner";
import { FCMInitializer } from "./fcm-initializer";
import { ServiceWorkerRegister } from "./service-worker-register";
import { BackgroundProvider } from "./background-provider";
import { QueryProvider } from "./query-provider";
// import { ScrollProgress } from "../ui/scroll-progress";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
      <ThemeProvider attribute="class" enableSystem defaultTheme="system">
        <QueryProvider>
          <BackgroundProvider>
            <ServiceWorkerRegister />
            <FCMInitializer />
            {children}
            <Toaster/>
          </BackgroundProvider>
        </QueryProvider>
      </ThemeProvider>
  );
}
