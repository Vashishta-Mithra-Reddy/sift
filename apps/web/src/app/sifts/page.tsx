"use client";

import { useEffect, useState } from "react";
import { getSiftsAction } from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon, ArrowRight01Icon, Time01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import type { SiftWithSource } from "@sift/auth/types";
import Link from "next/link";

export default function SiftsPage() {
  const [sifts, setSifts] = useState<SiftWithSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSifts = async () => {
        try {
            const data = await getSiftsAction();
            setSifts(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchSifts();
  }, []);

  return (
    <div className="mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Active Sifts</h1>
        <p className="text-muted-foreground">
            Continue your active recall sessions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sifts.map((sift) => (
            <Card key={sift.id} className="p-6 flex flex-col gap-4 group hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{sift.source?.title || "Untitled Source"}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <HugeiconsIcon icon={Time01Icon} className="h-3 w-3" />
                            <span>Started {formatDistanceToNow(new Date(sift.createdAt), { addSuffix: true })}</span>
                        </div>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <HugeiconsIcon icon={FlashIcon} className="h-6 w-6" />
                    </div>
                </div>

                <div className="pt-2">
                    <Link href={`/sift/${sift.id}`}>
                        <Button className="w-full gap-2">
                            {sift.status === 'in_progress' ? 'Resume Session' : 'Review Session'}
                            <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </Card>
        ))}
        
        {!loading && sifts.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
                <div className="mb-4 flex justify-center">
                    <div className="p-4 bg-muted rounded-full">
                        <HugeiconsIcon icon={FlashIcon} className="h-8 w-8 text-muted-foreground" />
                    </div>
                </div>
                <p>No active sifts found.</p>
                <Link href="/dashboard" className="text-primary hover:underline mt-2 inline-block">
                    Start a new one from your library
                </Link>
            </div>
        )}
      </div>
    </div>
  );
}
