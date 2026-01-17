import type { Metadata } from "next";

import { Geist, Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";

import "../index.css";
import Header from "@/components/blocks/Header";
import Providers from "@/components/providers";
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
      <body className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} antialiased`}>
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
