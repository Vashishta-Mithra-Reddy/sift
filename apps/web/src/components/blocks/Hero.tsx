"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import Silk from "@/components/Silk";

export default function Hero() {
  return (
    <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 md:px-0 min-h-[73vh] mt-0 sm:mt-0 border rounded-2xl overflow-hidden">
      
      <div className="absolute inset-0 -z-10 w-full h-full dark:opacity-95">
        <Silk
          speed={5}
          scale={1}
          // color="#2529eb"
          color="#6366F1"
          // color="#312E81"
          // color="#8B5CF6"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold font-outfit tracking-tighter text-white">
            Turn Passive Consumption <br />
            Into <span className="text-white">Active Mastery</span>.
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto px-2 md:px-16 text-pretty">
            Upload any document, notes, or recording, 
            and instantly generate precision-engineered quizzes to lock knowledge into your brain.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-12 rounded-xl px-8 text-lg gap-2">
              Start Sifting
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5" />
            </Button>
          </Link>
          {/* <Link href="#features">
             <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                Learn More
             </Button>
          </Link> */}
        </div>
      </div>
    </section>
  );
}
