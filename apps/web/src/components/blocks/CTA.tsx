"use client";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Rocket01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="px-4 md:px-0">
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 md:p-9">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="space-y-2 max-w-2xl text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    Lets Get You Started with Sift
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    The first step towards a more efficient and effective learning experience.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <Button size="lg" className="h-12 px-8 text-base w-full sm:w-auto gap-2 rounded-xl" asChild>
                    <Link href="/login">
                        Get Started
                        <HugeiconsIcon icon={Rocket01Icon} className="h-5 w-5" />
                    </Link>
                </Button>
                {/* <Button size="lg" variant="outline" className="h-12 px-8 text-base w-full sm:w-auto gap-2 bg-transparent border-border/50 hover:bg-muted/50 rounded-xl" asChild>
                    <Link href="/demo">
                        View Demo
                        <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5" />
                    </Link>
                </Button> */}
            </div>
        </div>
      </div>
    </section>
  );
}
