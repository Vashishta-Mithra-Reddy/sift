"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, FlashIcon, BookOpen01Icon, ChartHistogramIcon } from "@hugeicons/core-free-icons";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  if (session) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 md:py-32 space-y-8">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Turn Passive Consumption <br />
            Into <span className="text-primary">Active Mastery</span>.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sift is a minimalist active recall engine. Upload any document, notes, or recording, 
            and instantly generate precision-engineered quizzes to lock knowledge into your brain.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 text-lg gap-2">
              Start Sifting
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features">
             <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                Learn More
             </Button>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="container mx-auto px-4 py-20 border-t">
        <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <HugeiconsIcon icon={BookOpen01Icon} className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">The Drop Zone</h3>
                <p className="text-muted-foreground">
                    Drag and drop PDFs, Markdown, or paste URLs. Sift parses your content and prepares it for deep learning instantly.
                </p>
            </div>
            <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <HugeiconsIcon icon={FlashIcon} className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Zen Mode Recall</h3>
                <p className="text-muted-foreground">
                    No distractions. Just you and the questions. Experience a flow-state study session designed for maximum retention.
                </p>
            </div>
            <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <HugeiconsIcon icon={ChartHistogramIcon} className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Progress Echoes</h3>
                <p className="text-muted-foreground">
                    Track your mastery over time. Sift remembers what you forgot and targets your weak points in future sessions.
                </p>
            </div>
        </div>
      </section>
    </div>
  );
}
