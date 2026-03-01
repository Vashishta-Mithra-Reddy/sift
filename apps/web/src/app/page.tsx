// import { HugeiconsIcon } from "@hugeicons/react";
// import { FlashIcon, BookOpen01Icon, ChartHistogramIcon } from "@hugeicons/core-free-icons";
import { auth } from "@sift/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Hero from "@/components/blocks/Hero";
import Features from "@/components/blocks/Features";
import HowItWorks from "@/components/blocks/HowItWorks";
import FAQ from "@/components/blocks/FAQ";
import CTA from "@/components/blocks/CTA";
import Pricing from "@/components/blocks/Pricing";
import Quote from "@/components/blocks/Quote";

export default async function Home() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (session) {
    redirect("/sifts");
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-7xl mx-auto w-full">
      <Hero />

      {/* Feature Grid
      <section id="features" className="mx-auto py-9 px-4 md:px-0 border-t-0 border-dashed">
        <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border bg-card text-card-foreground space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <HugeiconsIcon icon={BookOpen01Icon} className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">The Drop Zone</h3>
                <p className="text-muted-foreground">
                    Drag and drop PDFs, Markdown, or paste URLs. Sift parses your content and prepares it for deep learning instantly.
                </p>
            </div>
            <div className="p-6 rounded-2xl border bg-card text-card-foreground space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <HugeiconsIcon icon={FlashIcon} className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Zen Mode Recall</h3>
                <p className="text-muted-foreground">
                    No distractions. Just you and the questions. Experience a flow-state study session designed for maximum retention.
                </p>
            </div>
            <div className="p-6 rounded-2xl border bg-card text-card-foreground space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <HugeiconsIcon icon={ChartHistogramIcon} className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Progress Echoes</h3>
                <p className="text-muted-foreground">
                    Track your mastery over time. Sift remembers what you forgot and targets your weak points in future sessions.
                </p>
            </div>
        </div>
      </section> */}

      <Features />
      <HowItWorks />
      {/* <div className="py-9">
      <Pricing />
      </div> */}
      <div className="pt-9">
      <Quote />
      </div>
      <div className="py-9">
      <FAQ />
      </div>
      <CTA />
    </div>
  );
}
