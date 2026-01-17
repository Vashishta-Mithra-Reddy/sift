import React, { forwardRef } from "react";
import { motion, type Transition, type SVGMotionProps } from "framer-motion";

interface MenuToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  className?: string;
  strokeWidth?: number;
  color?: string;
}

const MenuToggle = forwardRef<HTMLButtonElement, MenuToggleProps>(
  ({ isOpen, setIsOpen, className = "", strokeWidth = 2, color = "currentColor", ...props }, ref) => {
    
    // Smooth bezier curve for a "premium" feel
    const transition: Transition = {
      duration: 0.3,
      ease: [0.23, 1, 0.32, 1] as const, // The specific curve you requested
    };

    // Common props for the SVG lines
    const lineProps: SVGMotionProps<SVGPathElement> = {
      stroke: color,
      strokeWidth: strokeWidth,
      strokeLinecap: "round", // Ensures the ends are perfectly rounded
      vectorEffect: "non-scaling-stroke", // Keeps line thickness consistent if icon scales
      initial: "closed",
      animate: isOpen ? "open" : "closed",
      transition,
    };

    // Define the viewbox unit size (24x24 is standard)
    // Top line: y=6, Center line: y=12, Bottom line: y=18
    const unitHeight = 4;
    const unitWidth = 24;

    const topVariants = {
      closed: { d: `M 2 ${unitHeight} L ${unitWidth - 2} ${unitHeight}` },
      open: { d: `M 3 16.5 L 17 2.5` }, // Calculated cross coordinates
    };

    const centerVariants = {
      closed: { opacity: 1 },
      open: { opacity: 0 },
    };

    const bottomVariants = {
      closed: { d: `M 2 ${unitHeight * 5} L ${unitWidth - 2} ${unitHeight * 5}` },
      open: { d: `M 3 2.5 L 17 16.5` }, // Calculated cross coordinates
    };

    // ALTERNATIVE: Simpler "Rotate & Collapse" approach (Matches your original logic exactly but in SVG)
    // This is often smoother than path morphing for simple hamburgers.
    const topVariantsRotate = {
        closed: { rotate: 0, translateY: 0 },
        open: { rotate: 45, translateY: 6 } // Move down 6px to hit center (6 -> 12)
    };
    
    const bottomVariantsRotate = {
        closed: { rotate: 0, translateY: 0 },
        open: { rotate: -45, translateY: -6 } // Move up 6px to hit center (18 -> 12)
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative grid place-items-center h-10 w-10 rounded-md hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 ${className}`}
        {...props}
      >
        <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-6.5 w-6 overflow-visible" // w-6 matches your previous size
            preserveAspectRatio="none"
        >
            {/* Top Line */}
            <motion.path
                d="M 2 6 L 22 6"
                variants={topVariantsRotate}
                style={{ originX: "50%", originY: "50%" }} // Rotates around perfect center
                {...lineProps}
            />

            {/* Middle Line */}
            <motion.path
                d="M 2 12 L 22 12"
                variants={centerVariants}
                {...lineProps}
            />

            {/* Bottom Line */}
            <motion.path
                d="M 2 18 L 22 18"
                variants={bottomVariantsRotate}
                style={{ originX: "50%", originY: "50%" }} // Rotates around perfect center
                {...lineProps}
            />
        </motion.svg>
      </button>
    );
  }
);

MenuToggle.displayName = "MenuToggle";

export default MenuToggle;