"use client";

import { useEffect, useState } from "react";
import { getEchoesAction } from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartHistogramIcon, ChampionIcon } from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Echo } from "@sift/auth/types";

export default function EchoesPage() {
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEchoes = async () => {
        try {
            const data = await getEchoesAction();
            setEchoes(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchEchoes();
  }, []);

  // Calculate stats
  const totalMastery = echoes.reduce((acc, echo) => acc + echo.masteryLevel, 0);
  const avgMastery = echoes.length > 0 ? Math.round(totalMastery / echoes.length) : 0;

  return (
    <div className="mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Echoes</h1>
        <p className="text-muted-foreground">
            Track your long-term mastery and retention.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Topics Tracked</h3>
            <div className="text-2xl font-bold">{echoes.length}</div>
        </Card>
        <Card className="p-6 space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Average Mastery</h3>
            <div className="text-2xl font-bold">{avgMastery}%</div>
            <Progress value={avgMastery} className="h-2" />
        </Card>
        <Card className="p-6 space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Sift Score</h3>
            <div className="text-2xl font-bold flex items-center gap-2">
                {totalMastery * 10} 
                <HugeiconsIcon icon={ChampionIcon} className="h-5 w-5 text-yellow-500" />
            </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Topic Mastery</h2>
        <div className="grid gap-4">
            {echoes.map((echo) => (
                <div key={echo.id} className="flex items-center justify-between p-4 border rounded-xl bg-card">
                    <div className="space-y-1">
                        <div className="font-medium">{echo.topic}</div>
                        <div className="text-xs text-muted-foreground">Last reviewed: {new Date(echo.lastReviewedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-4 w-1/3">
                        <div className="text-sm font-medium w-12 text-right">{echo.masteryLevel}%</div>
                        <Progress value={echo.masteryLevel} className={
                            echo.masteryLevel > 80 ? "bg-green-100 [&>div]:bg-green-500" :
                            echo.masteryLevel > 50 ? "bg-yellow-100 [&>div]:bg-yellow-500" : 
                            "bg-red-100 [&>div]:bg-red-500"
                        } />
                    </div>
                </div>
            ))}

            {!loading && echoes.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                    No echoes yet. Complete some sifts to start tracking mastery.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
