"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import Silk from "@/components/Silk";

export default function Hero() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  };

  const item: Variants = {
    hidden: { 
      opacity: 0, 
      y: 28, 
      filter: "blur(12px)" 
    },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1], 
      }
    }
  };

  return (
    <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 md:px-0 min-h-[73vh] mt-0 sm:mt-0 border rounded-2xl overflow-hidden">
      
      <div className="absolute inset-0 -z-10 w-full h-full dark:opacity-95">
        <Silk
          speed={5}
          scale={1}
          color="#6366F1"
          noiseIntensity={2.5}
          rotation={0}
        />
      </div>

      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center gap-6" 
        variants={container} 
        initial="hidden" 
        animate="show"
      >
        <div className="space-y-4 max-w-3xl">
          <motion.h1 className="text-5xl md:text-6xl font-bold font-outfit tracking-tighter text-white" variants={item}>
            Turn Passive Consumption <br />
            Into <span className="text-white">Active Mastery</span>.
          </motion.h1>
          <motion.p className="text-lg md:text-xl text-white/80 mx-auto px-2 md:px-16" variants={item}>
            Turn any topic into an interactive course. Test your knowledge, go as deep as you need, and track your progress too.
          </motion.p>
        </div>

        <motion.div className="flex flex-col sm:flex-row gap-4" variants={item}>
          <Link href="/login">
            <Button size="lg" className="h-12 rounded-xl px-8 text-lg gap-2 bg-white text-black backdrop-blur-lg active:scale-[0.97] transition-all duration-300">
              Start Learning
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}