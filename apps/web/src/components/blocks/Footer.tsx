"use client";

import ModeToggle from "./ModeToggle";
import BackgroundToggle from "./BackgroundToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  BookOpen01Icon, 
  FlashIcon, 
  ChartHistogramIcon, 
  Settings01Icon,
  GithubIcon,
  NewTwitterIcon,
  DiscordIcon,
  Linkedin02Icon,
  YoutubeIcon,
  Rocket01Icon,
  AiCloud01Icon,
  InformationCircleIcon,
  SecurityCheckIcon,
  File01Icon
} from "@hugeicons/core-free-icons";

export default function Footer() {
  const pathname = usePathname();
  
  // Hide footer on Sift Session page for immersive experience
  if (pathname?.startsWith("/sift")) {
    return null;
  }

  return (
    <footer className="pt-0 pb-20 md:pb-8 font-jakarta">
      <div className="hidden md:flex md:flex-col mx-auto max-w-7xl bg-foreground/5 px-8 py-8 sm:rounded-xl backdrop-blur border border-foreground/5 bg-white/80 dark:bg-background/75 text-sm text-zinc-700 dark:text-zinc-300">
        <div className="hidden sm:flex items-center justify-between gap-4 border-b-2 border-dashed pb-4">
          <div className="text-base font-medium flex items-center gap-4">
            <div className="flex flex-col">
              <Link href="/" className="text-xl md:text-5xl font-bold tracking-tighter">sift.</Link>
              <p className="text-base text-muted-foreground font-medium mt-2">Active Recall Engine / <span className="text-foreground/30">Quiz thingy</span></p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <BackgroundToggle />
            <ModeToggle />
          </div>
        </div>

        <div className="hidden mt-8 mb-2 md:grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
         <div className="flex flex-col gap-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</div>
            <div className="flex flex-col gap-2 text-sm text-foreground/80">
              <Link href="/" className="hover:text-primary transition-colors w-fit flex items-center gap-2">
                <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" />
                About Sift
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resources</div>
            <div className="flex flex-col gap-2 text-sm text-foreground/80">
              <Link href="/login" className="hover:text-primary transition-colors w-fit flex items-center gap-2">
                <HugeiconsIcon icon={Rocket01Icon} className="h-4 w-4" />
                Getting Started
              </Link>
              <Link href="/ai" className="hover:text-primary transition-colors w-fit flex items-center gap-2">
                <HugeiconsIcon icon={AiCloud01Icon} className="h-4 w-4" />
                AI Studio
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</div>
            <div className="flex flex-col gap-2 text-sm text-foreground/80">
              <Link href="/dashboard" className="hover:text-primary transition-colors w-fit flex items-center gap-2">
                <HugeiconsIcon icon={BookOpen01Icon} className="h-4 w-4" />
                Library
              </Link>
              <Link href="/sifts" className="hover:text-primary transition-colors w-fit flex items-center gap-2">
                <HugeiconsIcon icon={FlashIcon} className="h-4 w-4" />
                Sifts
              </Link>
              <Link href="/echoes" className="hover:text-primary transition-colors w-fit flex items-center gap-2">
                <HugeiconsIcon icon={ChartHistogramIcon} className="h-4 w-4" />
                Echoes
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal</div>
            <div className="flex flex-col gap-2 text-sm text-foreground/80">
              <Link href="/policies/privacy" className="hover:text-primary transition-colors w-fit flex items-center gap-2">
                <HugeiconsIcon icon={SecurityCheckIcon} className="h-4 w-4" />
                Privacy Policy
              </Link>
              <Link href="/policies/terms" className="hover:text-primary transition-colors w-fit flex items-center gap-2">
                <HugeiconsIcon icon={File01Icon} className="h-4 w-4" />
                Terms of Service
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Socials</div>
            <div className="flex gap-4">
                <Link href="https://github.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                    <HugeiconsIcon icon={GithubIcon} className="h-5 w-5" />
                </Link>
                <Link href="https://twitter.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                    <HugeiconsIcon icon={NewTwitterIcon} className="h-5 w-5" />
                </Link>
                <Link href="https://linkedin.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                    <HugeiconsIcon icon={Linkedin02Icon} className="h-5 w-5" />
                </Link>
            </div>
          </div>
        </div>

        {/* <div title="footer" className="md:mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row md:border-t pt-0 md:pt-6 text-foreground/45 text-xs">
          <div className="flex flex-col sm:hidden gap-2 items-center justify-center opacity-55 dark:opacity-40">
            <Link href="/" className="text-foreground/70 hover:text-foreground/80 transition-colors cursor-pointer">About Sift</Link>
            <p className="font-medium text-muted-foreground/50">Version: v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
          </div>
          <div className="hidden sm:flex">© {new Date().getFullYear()} Sift. All rights reserved.</div>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/policies/privacy" className="hover:text-foreground/80 transition-colors cursor-pointer">Privacy</Link>
            <Link href="/policies/terms" className="hover:text-foreground/80 transition-colors cursor-pointer">Terms</Link>
            <p className="font-medium text-muted-foreground/50 sm:block hidden">v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
          </div>
        </div> */}
      </div>
    </footer>
  );
}
