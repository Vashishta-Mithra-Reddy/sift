'use client';
// import { HugeiconsIcon } from "@hugeicons/react";
// import { Loading03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  className?: string;
}

export function Loading({ className }: LoadingStateProps) {
  return (
    <div 
      className={cn(
        "flex min-h-dvh w-full items-center justify-center",
        "transition-all animate-in fade-in duration-300",
        className
      )}
    >
      {/* 2. This wrapper handles the smooth entrance (zoom + fade) */}
      <div className="animate-in zoom-in-95 fade-in transition-all duration-300 ease-out">
        <img 
          src="/sift-mascot.webp" 
          alt="Sift mascot" 
          className="h-32 w-32 animate-pulse opacity-90" 
        />
      </div>
    </div>
  );
}

export function LoadingState({ className }: LoadingStateProps) {
  return (
    <div className={cn("flex h-[80vh] w-full items-center justify-center bg-background", className)}>
      {/* <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin text-muted-foreground" /> */}
      <img src="/sift-mascot.webp" alt="Sift mascot" className="h-28 w-28 animate-pulse" />
    </div>
  );
}
