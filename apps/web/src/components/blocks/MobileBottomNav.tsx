"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION_ITEMS } from "@/app/config/navigation";
import { authClient } from "@/lib/auth-client";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  
  if (pathname.includes("/sift/")) return null;

  // Show all items for now, role based filtering later if needed
  const filteredNavItems = NAVIGATION_ITEMS.filter((item) => {
    return true; 
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/80 dark:bg-black/60 backdrop-blur-lg border-t border-border flex items-center justify-around px-2 py-3 safe-area-bottom">
        {filteredNavItems.map((item) => {
          const href = typeof item.href === 'string' ? item.href : item.href.pathname || '/';
          const isActive = pathname === href;
          
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <HugeiconsIcon 
                icon={item.icon} 
                className={cn(
                  "size-6",
                  isActive && "stroke-[2.5px]"
                )} 
              />
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
