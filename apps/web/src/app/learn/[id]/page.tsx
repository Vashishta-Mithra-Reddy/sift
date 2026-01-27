"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getLearningPathAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
    Mortarboard02Icon, 
    ArrowRight01Icon, 
    BookOpen01Icon,
    CheckmarkCircle02Icon,
    CircleIcon,
    Clock01Icon,
    ArrowLeft01Icon
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type LearningPathDetails = Awaited<ReturnType<typeof getLearningPathAction>>;

export default function LearningPathDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const [path, setPath] = useState<LearningPathDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchPath = async () => {
            try {
                const data = await getLearningPathAction(id);
                if (!data) {
                    toast.error("Learning path not found");
                    router.push("/learn");
                    return;
                }
                setPath(data);
            } catch (e) {
                console.error(e);
                toast.error("Failed to load learning path");
            } finally {
                setLoading(false);
            }
        };
        fetchPath();
    }, [id, router]);

    const handleContinue = () => {
        if (!path || !path.sifts || path.sifts.length === 0) {
             // Fallback to generating new content if empty
            router.push(`/ai?mode=learn&pathId=${path?.id}`);
            return;
        }

        // Resume from the last module
        const lastSift = path.sifts[path.sifts.length - 1];
        router.push(`/sift/${lastSift.siftId}`);
    };
    
    const handleGenerateNext = () => {
        if (!path) return;
        router.push(`/ai?mode=learn&pathId=${path.id}`);
    };

    if (loading) {
        return (
            <div className="mx-auto px-4 space-y-8">
                 <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <div className="grid gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!path) return null;

    return (
        <div className="mx-auto px-4 space-y-8 pb-8">
             {/* Header */}
             <div className="space-y-1">
                <Button variant="ghost" className="w-fit -ml-4 text-muted-foreground bg-background" onClick={() => router.push("/learn")}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                    Back to Paths
                </Button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-background">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{path.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />
                                    Started {formatDistanceToNow(new Date(path.createdAt))} ago
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <HugeiconsIcon icon={BookOpen01Icon} className="h-4 w-4" />
                                    {path.sifts.length} Modules
                                </span>
                            </div>
                        </div>
                        
                        {/* {path.summary && (
                             <div className="p-4 rounded-xl bg-background border border-border/50 text-sm leading-relaxed">
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <HugeiconsIcon icon={Mortarboard02Icon} className="h-4 w-4 text-primary" />
                                    Current Progress
                                </h3>
                                <div className="text-muted-foreground whitespace-pre-wrap">
                                    {path.summary}
                                </div>
                             </div>
                        )} */}
                    </div>

                    <div className="flex gap-3 shrink-0">
                         <Button size="lg" onClick={handleContinue} className="w-full md:w-auto px-4 text-base h-10 rounded-lg">
                            Continue Learning
                            <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" onClick={handleGenerateNext} className="w-full md:w-auto px-4 text-base h-10 rounded-lg">
                            Generate Next Module
                        </Button>
                    </div>
                </div>
             </div>

             {/* Timeline / Module List */}
             <div className="relative py-12 space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {path.sifts.map((item, index) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-center justify-between md:justify-normal md:even:flex-row-reverse group is-active"
                    >
                        {/* Icon */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shrink-0 md:order-1 md:group-even:-translate-x-1/2 md:group-odd:translate-x-1/2 z-10">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-primary" />
                        </div>

                        {/* Card */}
                        <Card 
                            className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-0 overflow-hidden transition-all cursor-pointer border-border/60 bg-card/40 backdrop-blur-sm border group-hover:border-foreground/30 gap-0"
                            onClick={() => router.push(`/sift/${item.siftId}`)}
                        >
                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Module {index + 1}</span>
                                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                                    {item.sift?.source?.title || `Module ${index + 1}`}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {item.sift?.summary || "Tap to review concepts and practice questions."}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
                
                {/* Next Step Placeholder */}
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: path.sifts.length * 0.1 + 0.2 }}
                    className="relative flex items-center justify-between md:justify-normal md:even:flex-row-reverse group"
                >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted shrink-0 md:order-1 md:group-even:-translate-x-1/2 md:group-odd:translate-x-1/2 z-10">
                        <HugeiconsIcon icon={CircleIcon} className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border-2 border-dashed border-muted flex items-center justify-center text-muted-foreground text-sm gap-2 cursor-pointer bg-background hover:text-primary hover:border-border transition-colors" onClick={handleGenerateNext}>
                        <HugeiconsIcon icon={Mortarboard02Icon} className="h-4 w-4" />
                        Generate next module...
                    </div>
                </motion.div>
             </div>
        </div>
    );
}
