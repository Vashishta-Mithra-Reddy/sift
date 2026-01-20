// "use client";

import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, FlashIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for casual learners and students getting started.",
    features: [
      "Create up to 5 Sifts",
      "Basic AI Question Generation",
      // "Standard Study Modes",
      // "Limited History Retention",
      "Mobile PWA Access"
    ],
    cta: "Start Learning",
    href: "/login",
    popular: false,
    variant: "outline" as const
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "For serious students who need unlimited mastery tools.",
    features: [
      "Close to Unlimited Sifts",
      "Advanced AI Models (Deep Dive)",
      // "Priority Question Generation",
      "Long-term Echo Retention",
      "Detailed Performance Analytics",
      // "Export to Anki/PDF"
    ],
    cta: "Get Pro",
    href: "/login?plan=pro",
    popular: true,
    variant: "default" as const
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-12 border border-border/50 rounded-2xl bg-background backdrop-blur-sm">
      <div className="px-6 md:px-12">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Invest in your brain. Choose the plan that fits your learning goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full">
          {/* Free Plan Block */}
          <div className="flex flex-col p-8 rounded-3xl border border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#00000008_10px,#00000008_11px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ffffff08_10px,#ffffff08_11px)]">
            <div className="space-y-2 mb-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold">{plans[0].name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{plans[0].price}</span>
                    <span className="text-muted-foreground">/{plans[0].period}</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {plans[0].description}
                </p>
            </div>

            <div className="space-y-4 flex-1 mb-8">
                {plans[0].features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full p-1 bg-muted text-muted-foreground">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm">{feature}</span>
                    </div>
                ))}
            </div>

            <Button 
                size="lg" 
                variant={plans[0].variant} 
                className="w-full h-12 text-base rounded-xl mt-auto"
                asChild
            >
                <Link href="/login">
                    {plans[0].cta}
                </Link>
            </Button>
          </div>

          {/* Pro Plan Block */}
          <div className="relative flex flex-col p-8 rounded-3xl border-2 border-dashed border-border/80 backdrop-blur-sm transition-all duration-300 h-full">
            {/* <div className="absolute top-6 right-6 md:top-8 md:right-8">
                 <Badge className="bg-primary text-primary-foreground hover:bg-primary px-4 py-1 h-8 rounded-full text-sm font-medium border-4 border-background">
                    Most Popular
                </Badge>
            </div> */}

            <div className="space-y-2 mb-8 mt-2 md:mt-0">
                <h3 className="text-2xl font-semibold">{plans[1].name}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{plans[1].price}</span>
                    <span className="text-muted-foreground">/{plans[1].period}</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[80%] md:max-w-full">
                    {plans[1].description}
                </p>
            </div>

            <div className="space-y-4 flex-1 mb-8">
                {plans[1].features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full p-1 bg-primary/10 text-primary">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm">{feature}</span>
                    </div>
                ))}
            </div>

            <Button 
                size="lg" 
                variant={plans[1].variant} 
                className="w-full h-12 text-base rounded-xl mt-auto"
                asChild
            >
                <Link href="/login?plan=pro">
                    {plans[1].cta}
                    <HugeiconsIcon icon={FlashIcon} className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
