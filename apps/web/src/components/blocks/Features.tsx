"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon, BookOpen01Icon, ChartHistogramIcon } from "@hugeicons/core-free-icons";
import { motion, type Variants } from "framer-motion";

export default function Features() {
  const container: Variants = { 
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <section id="features" className="mx-auto py-9 md:px-0">
        {/* <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything you need to master anything</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Sift combines advanced AI with proven cognitive science principles to help you learn faster and remember longer.
            </p>
        </div> */}
        <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-3 gap-8"
        >
            <motion.div variants={item} className="group p-8 rounded-3xl border bg-card/50 hover:bg-card/80 transition-colors text-card-foreground space-y-4 backdrop-blur-sm">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-500">
                    <HugeiconsIcon icon={BookOpen01Icon} className="h-7 w-7" />
                </div>
                {/* <h3 className="text-xl font-semibold">The Drop Zone</h3> */}
                <h3 className="text-xl font-semibold">AI Course Builder</h3>
                {/* <p className="text-muted-foreground leading-relaxed">
                    Drag and drop PDFs, Markdown, or paste URLs. Sift parses your content and prepares it for deep learning instantly.
                </p> */}
                <p className="text-muted-foreground leading-relaxed">
                    Describe a topic and Sift generates a full learning path with modules, objectives, quizzes, flashcards ...
                </p>
            </motion.div>
            <motion.div variants={item} className="group p-8 rounded-3xl border bg-card/50 hover:bg-card/80 transition-colors text-card-foreground space-y-4 backdrop-blur-sm">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-500">
                    <HugeiconsIcon icon={FlashIcon} className="h-7 w-7" />
                </div>
                {/* <h3 className="text-xl font-semibold">Zen Mode Recall</h3> */}
                <h3 className="text-xl font-semibold">Guided Learning Flow</h3>
                {/* <p className="text-muted-foreground leading-relaxed">
                    No distractions. Just you and the questions. Experience a flow-state study session designed for maximum retention.
                </p> */}
                <p className="text-muted-foreground leading-relaxed">
                    Stay in flow with step‑by‑step lessons, checkpoints, and reinforcement tailored to your pace.
                </p>
            </motion.div>
            <motion.div variants={item} className="group p-8 rounded-3xl border bg-card/50 hover:bg-card/80 transition-colors text-card-foreground space-y-4 backdrop-blur-sm">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-500">
                    <HugeiconsIcon icon={ChartHistogramIcon} className="h-7 w-7" />
                </div>
                {/* <h3 className="text-xl font-semibold">Progress Echoes</h3> */}
                <h3 className="text-xl font-semibold">Mastery Tracking</h3>
                {/* <p className="text-muted-foreground leading-relaxed">
                    Track your mastery over time. Sift remembers what you forgot and targets your weak points in future sessions.
                </p> */}
                <p className="text-muted-foreground leading-relaxed">
                    See what you’ve mastered, where you’re stuck, and what to review next across your entire path.
                </p>
            </motion.div>
        </motion.div>
    </section>
  );
}
