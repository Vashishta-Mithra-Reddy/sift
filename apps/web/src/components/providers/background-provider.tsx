"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type BackgroundPattern = "hatching" | "grid" | "dots" | "cross" | "paper" | "math" | "diamonds" | "rain";

type BackgroundContextType = {
  showBackground: boolean;
  setShowBackground: (show: boolean) => void;
  pattern: BackgroundPattern;
  setPattern: (pattern: BackgroundPattern) => void;
};

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [showBackground, setShowBackground] = useState(true);
  const [pattern, setPattern] = useState<BackgroundPattern>("hatching");

  // Persist preference
  useEffect(() => {
    const savedShow = localStorage.getItem("sift_show_background");
    if (savedShow !== null) {
      setShowBackground(savedShow === "true");
    }

    const savedPattern = localStorage.getItem("sift_background_pattern") as BackgroundPattern;
    if (savedPattern && ["hatching", "grid", "dots", "cross", "paper", "math", "diamonds", "rain"].includes(savedPattern)) {
      setPattern(savedPattern);
    }
  }, []);

  const toggleBackground = (show: boolean) => {
    setShowBackground(show);
    localStorage.setItem("sift_show_background", String(show));
  };

  const changePattern = (newPattern: BackgroundPattern) => {
    setPattern(newPattern);
    localStorage.setItem("sift_background_pattern", newPattern);
  };

  const getPatternStyle = () => {
    switch (pattern) {
      case "grid":
        return "bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:24px_24px]";
      case "dots":
        return "bg-[radial-gradient(#00000012_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#ffffff12_1.5px,transparent_1.5px)] bg-[size:20px_20px]";
      case "cross":
         return "bg-[radial-gradient(#00000012_1.5px,transparent_1.5px),radial-gradient(#00000012_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#ffffff12_1.5px,transparent_1.5px),radial-gradient(#ffffff12_1.5px,transparent_1.5px)] bg-[size:20px_20px] [background-position:0_0,10px_10px]";
      case "paper":
        return "bg-[linear-gradient(to_bottom,#00000006_1px,transparent_1px)] dark:bg-[linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:100%_32px]";
      case "math":
        return "bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:14px_14px]";
      case "diamonds":
        return "bg-[linear-gradient(45deg,#00000020_2px,transparent_2px),linear-gradient(-45deg,#00000020_2px,transparent_2px)] dark:bg-[linear-gradient(45deg,#ffffff20_2px,transparent_2px),linear-gradient(-45deg,#ffffff20_2px,transparent_2px)] bg-[size:40px_40px]";
      case "rain":
        return "bg-[linear-gradient(to_right,#00000010_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px)] bg-[size:20px_100%]";
      case "hatching":
      default:
        return "bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#00000008_10px,#00000008_11px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ffffff08_10px,#ffffff08_11px)]";
    }
  };

  return (
    <BackgroundContext.Provider value={{ showBackground, setShowBackground: toggleBackground, pattern, setPattern: changePattern }}>
      {showBackground && (
        <div className="fixed inset-0 -z-50 h-full w-full bg-white dark:bg-black pointer-events-none transition-opacity duration-500">
          <div className={`absolute h-full w-full ${getPatternStyle()}`} />
        </div>
      )}
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error("useBackground must be used within a BackgroundProvider");
  }
  return context;
}
