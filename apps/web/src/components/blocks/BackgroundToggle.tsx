"use client";

import { ViewIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import useSound from "use-sound";
import { useBackground } from "@/components/providers/background-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function BackgroundToggle() {
  const { showBackground, setShowBackground } = useBackground();
  const [mounted, setMounted] = React.useState(false);
  const [click] = useSound("/audio/click.wav", { volume: 0.2 });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleBackground = () => {
    if (!mounted) return;
    setShowBackground(!showBackground);
    click();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={
            "relative flex cursor-pointer items-center gap-2 rounded-xl px-4 py-3.5 text-center text-foreground transition-all duration-300 hover:bg-foreground/5 hover:text-foreground/90 dark:text-muted-foreground"
          }
          onClick={toggleBackground}
        >
          <div
            className={`transition-all duration-300 ${
              showBackground ? "rotate-0 scale-100" : "-rotate-90 scale-0 absolute"
            }`}
          >
            <HugeiconsIcon icon={ViewIcon} className="size-6" />
          </div>
          <div
            className={`transition-all duration-300 ${
              !showBackground ? "rotate-0 scale-100" : "rotate-90 scale-0 absolute"
            }`}
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-6" />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="font-jakarta">
        <p>Toggle Background Pattern</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default BackgroundToggle;
