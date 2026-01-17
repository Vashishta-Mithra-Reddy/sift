"use client";

import * as React from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageViewer({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [scale, setScale] = React.useState(1);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialIndex]);

  React.useEffect(() => {
    setScale(1);
  }, [currentIndex]);

  const handleNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useHotkeys("esc", onClose, { enabled: isOpen });
  useHotkeys("right", handleNext, { enabled: isOpen });
  useHotkeys("left", handlePrev, { enabled: isOpen });

  // Swipe configuration
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/90 backdrop-blur-md touch-none"
          onClick={onClose} // Close on backdrop click
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white transition-colors rounded-full bg-black/20 hover:bg-black/40"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 z-50 p-3 text-white/70 hover:text-white transition-colors rounded-full bg-black/20 hover:bg-black/40 hidden md:flex"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 z-50 p-3 text-white/70 hover:text-white transition-colors rounded-full bg-black/20 hover:bg-black/40 hidden md:flex"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Main Image */}
          <div
            className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking image area
          >
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9, x: 0 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 0 }}
              transition={{ 
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              drag={scale === 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  handleNext();
                } else if (swipe > swipeConfidenceThreshold) {
                  handlePrev();
                }
              }}
              className="w-full h-full flex items-center justify-center"
            >
              {isMobile ? (
                <TransformWrapper
                  initialScale={1}
                  minScale={1}
                  maxScale={4}
                  onTransformed={(e) => setScale(e.state.scale)}
                  wheel={{ step: 0.2 }}
                  doubleClick={{ disabled: false }}
                  panning={{ disabled: scale <= 1 }}
                >
                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <img
                      src={images[currentIndex]}
                      alt={`Image ${currentIndex + 1}`}
                      className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    />
                  </TransformComponent>
                </TransformWrapper>
              ) : (
                <img
                  src={images[currentIndex]}
                  alt={`Image ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                />
              )}
            </motion.div>
          </div>

          {/* Thumbnails / Counter */}
          <div
            className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-white/80 text-sm font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
              {currentIndex + 1} / {images.length}
            </div>
            
            {/* Optional: Small Thumbnails Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto max-w-[90vw] p-2 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "relative w-12 h-12 rounded-md overflow-hidden transition-all border-2 flex-shrink-0",
                      currentIndex === idx
                        ? "border-white opacity-100 scale-110"
                        : "border-transparent opacity-50 hover:opacity-80"
                    )}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
