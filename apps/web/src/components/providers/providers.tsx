"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "../ui/sonner";
import { FCMInitializer } from "./fcm-initializer";
import { ServiceWorkerRegister } from "./service-worker-register";
import { BackgroundProvider } from "./background-provider";
import { QueryProvider } from "./query-provider";
import { PostHogProvider } from "./posthog-provider";
import PostHogPageView from "../posthog-page-view";
import PostHogIdentify from "../posthog-identify";
// import { ScrollProgress } from "../ui/scroll-progress";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <PostHogPageView />
      <PostHogIdentify />
      <ThemeProvider attribute="class" enableSystem defaultTheme="system" disableTransitionOnChange>
        <QueryProvider>
          <BackgroundProvider>
            <ServiceWorkerRegister />
            <FCMInitializer />
            {children}
            <Toaster/>
          </BackgroundProvider>
        </QueryProvider>
      </ThemeProvider>
    </PostHogProvider>
  );
}
