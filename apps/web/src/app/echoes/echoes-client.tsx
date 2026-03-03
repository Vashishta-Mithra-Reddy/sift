"use client";

import { useState } from "react";
import { getEchoesAction } from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChampionIcon } from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { EchoWithSource } from "@sift/auth/types";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";

interface EchoesPageClientProps {
    initialEchoes: EchoWithSource[];
}

export default function EchoesPageClient({ initialEchoes }: EchoesPageClientProps) {
  // Sort echoes by mastery level ascending (lowest mastery first)
  const sortedEchoes = [...initialEchoes].sort((a, b) => a.masteryLevel - b.masteryLevel);
  const [echoes] = useState<EchoWithSource[]>(sortedEchoes);

  // Calculate stats
  const totalMastery = echoes.reduce((acc, echo) => acc + echo.masteryLevel, 0);
  const avgMastery = echoes.length > 0 ? Math.round(totalMastery / echoes.length) : 0;

  const chartConfig = {
    masteryLevel: {
      label: "Mastery",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="mx-auto md:px-4 space-y-8">
      <div className="space-y-2 bg-background dark:bg-transparent rounded-xl">
        <h1 className="text-3xl font-bold tracking-tight">Echoes</h1>
        <p className="text-muted-foreground">
            Track your long-term mastery and retention.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
        <motion.div variants={item} className="h-full">
            <Card className="p-6 space-y-2 h-full">
                <h3 className="text-sm font-medium text-muted-foreground mb-0">Sift Score</h3>
                <div className="text-2xl font-bold flex items-center gap-2">
                    {totalMastery * 10} 
                    <HugeiconsIcon icon={ChampionIcon} className="h-5 w-5 text-yellow-500" />
                </div>
            </Card>
        </motion.div>
        <motion.div variants={item} className="h-full">
            <Card className="p-6 space-y-2 h-full">
                <h3 className="text-sm font-medium text-muted-foreground mb-0">Topics Tracked</h3>
                <div className="text-2xl font-bold">{echoes.length}</div>
            </Card>
        </motion.div>
        <motion.div variants={item} className="h-full">
            <Card className="p-6 space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-0">Average Mastery</h3>
                <div className="text-2xl font-bold mb-1">{avgMastery}%</div>
                <Progress value={avgMastery} className="h-2" />
            </Card>
        </motion.div>
        </div>

      {echoes.length > 0 && (
        <motion.div variants={item} className="space-y-4">
            <h2 className="text-xl font-semibold">Mastery Overview</h2>
            <ChartContainer config={chartConfig} className="min-h-[200px] max-h-[420px] w-full bg-background dark:bg-transparent rounded-xl border border-border/30 py-2 pt-6 px-2">
              <BarChart accessibilityLayer data={echoes}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="topic"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.length > 10 ? `${value.slice(0, 10)}...` : value}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="masteryLevel" fill="var(--chart-1)" radius={4} />
              </BarChart>
            </ChartContainer>
        </motion.div>
      )}

      <motion.div variants={item} className="space-y-4 min-w-0 w-full max-w-full">
        <h2 className="text-xl font-semibold">Topic Mastery</h2>
        <div className="flex flex-col gap-4">
            {echoes.map((echo, index) => (
                <motion.div 
                    variants={item} 
                    key={echo.id} 
                    className="flex items-center justify-between p-4 border rounded-xl bg-card gap-4 w-full"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    custom={index}
                >
                    <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-baseline gap-1 min-w-0">
                            <div className="font-medium line-clamp-2 md:line-clamp-1 max-w-[97%]">
                              {echo.moduleNumber !== null && echo.moduleNumber > 0 && (
                                <span className="font-medium">
                                    Module {echo.moduleNumber}: 
                                </span>
                              )}
                            {" "+echo.topic}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Last reviewed: {new Date(echo.lastReviewedAt).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-1/3 shrink-0">
                        <div className={cn(
                            "text-sm font-semibold w-12 text-right"
                        )}>{echo.masteryLevel}%</div>
                        <Progress value={echo.masteryLevel} className={cn(
                            "h-2",
                            echo.masteryLevel >= 80 ? "[&>*]:bg-emerald-500" :
                            echo.masteryLevel >= 50 ? "[&>*]:bg-amber-500" : 
                            "[&>*]:bg-rose-500"
                        )} />
                    </div>
                </motion.div>
            ))}

            {echoes.length === 0 && (
                <motion.div variants={item} className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                    No echoes yet. Complete some sifts to start tracking mastery.
                </motion.div>
            )}
        </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
