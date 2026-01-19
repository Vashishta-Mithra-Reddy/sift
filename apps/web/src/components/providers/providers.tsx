"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "../ui/sonner";
import { FCMInitializer } from "./fcm-initializer";
import { ServiceWorkerRegister } from "./service-worker-register";
import { BackgroundProvider } from "./background-provider";
// import { ScrollProgress } from "../ui/scroll-progress";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableSystem defaultTheme="system">
      <BackgroundProvider>
        <ServiceWorkerRegister />
        <FCMInitializer />
        {children}
          {/* <div className="pointer-events-none absolute left-0 top-0 w-full">
          <div className='absolute left-0 top-0 h-1 w-full bg-[#E6F4FE] dark:bg-[#111927]' />
           */}
          {/* <ScrollProgress className="fixed bottom-0 z-[10000] h-1 dark:bg-[#0090FF] bg-gray-600"/> */}
          {/* </div> */}
          <Toaster />
      </BackgroundProvider>
    </ThemeProvider>
  );
}
