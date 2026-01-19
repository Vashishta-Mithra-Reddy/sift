"use client";

import { useEffect, useState } from "react";
import { getSiftsAction } from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon, ArrowRight01Icon, Time01Icon, Search01Icon, FilterHorizontalIcon, SortByUp01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import type { SiftWithSource } from "@sift/auth/types";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

export default function SiftsPage() {
  const [sifts, setSifts] = useState<SiftWithSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"date-desc" | "date-asc" | "alpha-asc" | "alpha-desc">("date-desc");

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

  const filteredSifts = sifts
    .filter(sift => 
      sift.source?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "alpha-asc":
          return (a.source?.title || "").localeCompare(b.source?.title || "");
        case "alpha-desc":
          return (b.source?.title || "").localeCompare(a.source?.title || "");
        default:
          return 0;
      }
    });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {/* <HugeiconsIcon icon={FlashIcon} className="h-8 w-8 text-primary" /> */}
            Active Sifts
          </h1>
          <p className="text-muted-foreground text-lg">
              Manage and continue your active recall sessions.
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-[300px]">
                <HugeiconsIcon icon={Search01Icon} className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search sifts..." 
                    className="pl-9 bg-muted/50 border-transparent focus:bg-background transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                        <HugeiconsIcon icon={SortByUp01Icon} className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortOrder("date-desc")}>
                        Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOrder("date-asc")}>
                        Oldest First
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortOrder("alpha-asc")}>
                        A-Z
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOrder("alpha-desc")}>
                        Z-A
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
            // Skeleton Loading State
            Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-border/50 bg-card/50">
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <div className="space-y-2 pt-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </CardHeader>
                    <CardFooter className="p-0 px-4 py-6">
                        <Skeleton className="h-0 w-full rounded-md" />
                    </CardFooter>
                </Card>
            ))
        ) : filteredSifts.length > 0 ? (
            // Active Sifts
            filteredSifts.map((sift) => (
                <Card key={sift.id} className="group flex flex-col overflow-hidden border-border/50 bg-card/50 hover:bg-card hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-105 transition-transform duration-300">
                                <HugeiconsIcon icon={FlashIcon} className="h-6 w-6" />
                            </div>
                            {/* <Badge variant={sift.status === 'in_progress' ? 'secondary' : 'outline'} className="capitalize">
                                {sift.status.replace('_', ' ')}
                            </Badge> */}
                        </div>
                        <CardTitle className="line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {sift.source?.title || "Untitled Source"}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                            <HugeiconsIcon icon={Time01Icon} className="h-3 w-3" />
                            <span>Started {formatDistanceToNow(new Date(sift.createdAt), { addSuffix: true })}</span>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 hidden">
                        {/* Add progress bar or stats here if available in the future */}
                    </CardContent>

                    <CardFooter className="p-0">
                        <Link href={`/sift/${sift.id}`} className="w-full h-full px-4 py-3 flex items-center justify-center gap-2 transition-all duration-300">
                            {/* <Button className="w-full h-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all" variant="secondary"> */}
                                {sift.status === 'in_progress' ? 'Resume Session' : 'Review Session'}
                                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                            {/* </Button> */}
                        </Link>
                    </CardFooter>
                </Card>
            ))
        ) : (
            // Empty State
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-6 bg-muted/20 rounded-3xl border border-dashed border-muted-foreground/20 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <div className="relative p-6 bg-background rounded-full shadow-sm border">
                        <HugeiconsIcon icon={FlashIcon} className="h-10 w-10 text-primary" />
                    </div>
                </div>
                <div className="space-y-2 max-w-sm mx-auto">
                    <h3 className="text-xl font-bold">No active sifts found</h3>
                    <p className="text-muted-foreground">
                        {searchQuery ? "Try adjusting your search query." : "You haven't started any sifts yet. Pick a source from your library to begin."}
                    </p>
                </div>
                {searchQuery ? (
                    <Button variant="outline" onClick={() => setSearchQuery("")}>Clear Search</Button>
                ) : (
                    <Link href="/dashboard">
                        <Button size="lg" className="gap-2">
                            Go to Library
                            <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
                        </Button>
                    </Link>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
