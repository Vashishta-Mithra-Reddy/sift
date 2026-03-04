// import { HugeiconsIcon } from "@hugeicons/react";
// import { Loading03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  className?: string;
}

export function LoadingState({ className }: LoadingStateProps) {
  return (
    <div className={cn("flex h-[80vh] w-full items-center justify-center", className)}>
      {/* <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin text-muted-foreground" /> */}
      <img src="/sift-mascot.webp" alt="Sift mascot" className="h-28 w-28 animate-pulse" />
    </div>
  );
}

export function Loading({ className }: LoadingStateProps) {
  return (
    <div className={cn("flex h-[100vh] w-full items-center justify-center bg-background", className)}>
      {/* <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin text-muted-foreground" /> */}
      <img src="/sift-mascot.webp" alt="Sift mascot" className="h-28 w-28 animate-pulse" />
    </div>
  );
}