import type { Metadata } from "next";

import { Geist, Geist_Mono, Inter, Plus_Jakarta_Sans, Outfit } from "next/font/google";

import "../index.css";
import Header from "@/components/blocks/Header";
import Providers from "@/components/providers/providers";
import { Analytics } from "@vercel/analytics/next"
import Footer from "@/components/blocks/Footer";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sift | Recall What You've Learned | Active Recall Engine | Quiz Thingy",
  description: "Sift is a platform that helps you recall information more effectively. Simply put it creates quizes and helps you master the information you learn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} ${outfit.variable} antialiased relative`}>
        {/* Global Hatching Pattern Background */}
        {/* <div className="fixed inset-0 -z-50 h-full w-full bg-white dark:bg-black pointer-events-none">
          <div className="absolute h-full w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#00000008_10px,#00000008_11px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ffffff08_10px,#ffffff08_11px)]" />
        </div> */}
        
        <Providers>
          <div className="grid min-h-svh grid-rows-[auto_1fr]">
            <Analytics />
            <Header />
            <main className="wrapperx">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
