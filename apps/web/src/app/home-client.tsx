"use client";

import { motion, type Variants } from "framer-motion";
import Hero from "@/components/blocks/Hero";
import Features from "@/components/blocks/Features";
import HowItWorks from "@/components/blocks/HowItWorks";
import FAQ from "@/components/blocks/FAQ";
import CTA from "@/components/blocks/CTA";
import Quote from "@/components/blocks/Quote";

export default function HomeClient() {
  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      }
    },
  };

  const fadeIn: Variants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1, 
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-7xl mx-auto w-full">
      <motion.div variants={fadeIn} initial="hidden" animate="show" className="w-full">
        <Hero />
      </motion.div>

      <motion.div 
        variants={item}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="w-full"
      >
        <Features />
      </motion.div>

      <motion.div 
        variants={item}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="w-full"
      >
        <HowItWorks />
      </motion.div>

      <motion.div 
        variants={item} 
        className="pt-9 w-full"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Quote />
      </motion.div>

      <motion.div 
        variants={item} 
        className="py-9 w-full"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <FAQ />
      </motion.div>

      <motion.div 
        variants={item}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="w-full"
      >
        <CTA />
      </motion.div>
    </div>
  );
}
