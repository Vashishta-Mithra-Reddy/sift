"use client";

import Silk from "@/components/Silk";

export default function Quote() {
  return (
    <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 md:px-0 py-12 mt-0 sm:mt-0 border rounded-2xl overflow-hidden">
      
      <div className="absolute inset-0 -z-10 w-full h-full opacity-80">
        <Silk
          speed={5}
          scale={1}
          color="#2529eb"
        //   #1114bb
          noiseIntensity={1.5}
          rotation={5.10}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-outfit tracking-tighter text-white">
            "Don't just read. Remember."
          </h1>
        </div>
      </div>
    </section>
  );
}
