"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon, BookOpen01Icon, ChartHistogramIcon } from "@hugeicons/core-free-icons";

export default function Features() {
  return (
    <section id="features" className="mx-auto py-9 px-4 md:px-0">
        {/* <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything you need to master anything</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Sift combines advanced AI with proven cognitive science principles to help you learn faster and remember longer.
            </p>
        </div> */}
        <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-3xl border bg-card/50 hover:bg-card/80 transition-colors text-card-foreground space-y-4 backdrop-blur-sm">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-500">
                    <HugeiconsIcon icon={BookOpen01Icon} className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold">The Drop Zone</h3>
                <p className="text-muted-foreground leading-relaxed">
                    Drag and drop PDFs, Markdown, or paste URLs. Sift parses your content and prepares it for deep learning instantly.
                </p>
            </div>
            <div className="group p-8 rounded-3xl border bg-card/50 hover:bg-card/80 transition-colors text-card-foreground space-y-4 backdrop-blur-sm">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-500">
                    <HugeiconsIcon icon={FlashIcon} className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold">Zen Mode Recall</h3>
                <p className="text-muted-foreground leading-relaxed">
                    No distractions. Just you and the questions. Experience a flow-state study session designed for maximum retention.
                </p>
            </div>
            <div className="group p-8 rounded-3xl border bg-card/50 hover:bg-card/80 transition-colors text-card-foreground space-y-4 backdrop-blur-sm">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-500">
                    <HugeiconsIcon icon={ChartHistogramIcon} className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold">Progress Echoes</h3>
                <p className="text-muted-foreground leading-relaxed">
                    Track your mastery over time. Sift remembers what you forgot and targets your weak points in future sessions.
                </p>
            </div>
        </div>
    </section>
  );
}
