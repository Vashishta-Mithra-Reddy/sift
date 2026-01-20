"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon, CpuIcon, CheckmarkCircle02Icon, Brain02Icon } from "@hugeicons/core-free-icons";

const steps = [
  {
    icon: File01Icon,
    title: "Upload Source",
    description: "Drop your PDF, notes, or paste a link. We handle the rest."
  },
  {
    icon: CpuIcon,
    title: "AI Processing",
    description: "Our engine analyzes your content and extracts key concepts."
  },
  {
    icon: Brain02Icon,
    title: "Active Recall",
    description: "Generate intelligent quizzes that test your true understanding."
  },
  {
    icon: CheckmarkCircle02Icon,
    title: "Mastery",
    description: "Track your progress and close your knowledge gaps."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-12 border border-border/60 bg-background transition-colors text-card-foreground rounded-2xl">
      <div className="mx-auto px-4 md:px-0">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How Sift Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From raw content to retained knowledge in four simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative px-16">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-10 left-32 right-40 w-9/12 h-0.5 bg-gradient-to-r from-transparent via-border/60 to-border/60 z-0" />

          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-5 z-10">
              <div className="h-20 w-20 rounded-full border-2 border-border/40 bg-card flex items-center justify-center relative z-10">
                <HugeiconsIcon icon={step.icon} className="h-8 w-8 text-primary/80" />
                <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs border-[0px] border-background">
                  {index + 1}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-card-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-card-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
