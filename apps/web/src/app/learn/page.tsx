"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLearningPathsAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
    Mortarboard02Icon, 
    ArrowRight01Icon, 
    PlusSignIcon,
    BookOpen01Icon,
    Clock01Icon
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Define type based on action return
type LearningPath = Awaited<ReturnType<typeof getLearningPathsAction>>[number];

export default function LearningPathsPage() {
    const [paths, setPaths] = useState<LearningPath[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchPaths = async () => {
            try {
                const data = await getLearningPathsAction();
                setPaths(data);
            } catch (e) {
                console.error(e);
                toast.error("Failed to load learning paths");
            } finally {
                setLoading(false);
            }
        };
        fetchPaths();
    }, []);

    const handleResume = (path: LearningPath) => {
        // if (!path.sifts || path.sifts.length === 0) {
        //     router.push(`/ai?mode=learn&pathId=${path.id}`);
        //     return;
        // }

        // Find the last sift
        // const lastSiftRef = path.sifts[path.sifts.length - 1];
        
        // If we wanted to be smarter, we could check if the last sift is "completed"
        // But for now, jumping to the last added module is the most logical "resume" point
        // as the user might be in the middle of it.
        // router.push(`/sift/${lastSiftRef.siftId}`);

        router.push(`/learn/${path.id}`);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-64 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto md:px-4 space-y-12 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-background" >
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        My Learning Paths
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Structured, AI-generated curriculums designed for mastery.
                    </p>
                </div>
                <Button onClick={() => router.push("/ai")} size="lg" className="transition-all h-10 px-4 text-base rounded-xl">
                    <HugeiconsIcon icon={PlusSignIcon} className="mr-1 h-5 w-5" />
                    New Path
                </Button>
            </div>

            {paths.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-background rounded-3xl border-2 border-dashed border-border"
                >
                    <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4">
                        <HugeiconsIcon icon={Mortarboard02Icon} className="h-10 w-10" />
                    </div>
                    <div className="space-y-2 max-w-md">
                        <h3 className="text-xl font-semibold">No learning paths yet</h3>
                        <p className="text-muted-foreground">
                            Start a new journey! Sift will generate a personalized curriculum for any topic you want to master.
                        </p>
                    </div>
                    <Button onClick={() => router.push("/ai")} size="lg" className="transition-all h-10 px-4 text-base">
                        Start Learning
                    </Button>
                </motion.div>
            ) : (
                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {paths.map((path) => (
                        <motion.div key={path.id} variants={item}>
                            <Card className="h-full flex flex-col overflow-hidden transition-shadow group ring-0 border border-border/80 bg-background backdrop-blur-sm gap-3">
                                <CardHeader className="flex justify-between items-center pt-1">
                                    {/* <div className="flex justify-between items-start gap-4">
                                        
                                    </div> */}
                                    <CardTitle className="flex flex-row justify-between items-center text-xl font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                        {path.title}
                                    </CardTitle>

                                    {/* <div className="px-2.5 py-1 rounded-full bg-secondary/50 text-xs font-medium text-secondary-foreground flex items-center gap-1.5">
                                            <HugeiconsIcon icon={Clock01Icon} className="h-3 w-3" />
                                            {new Date(path.updatedAt).toLocaleDateString()}
                                    </div> */}
                                </CardHeader>
                                <CardContent className="flex-1 pb-0">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{path.sifts.length} Modules</span>
                                            {/* Future: Calculate actual completion based on sift status */}
                                            <span>In Progress</span>
                                        </div>
                                        {/* Visual progress bar (placeholder logic for now) */}
                                        <Progress value={Math.min((path.sifts.length / 10) * 100, 100)} className="h-1.5" />
                                        
                                        {path.summary && (
                                            <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground leading-relaxed">
                                                <p className="line-clamp-2">{path.summary.split('\n').slice(0, 3).join(' ').replace(/^- /, '')}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-4">
                                    <Button 
                                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300" 
                                        onClick={() => handleResume(path)}
                                    >
                                        Resume Path
                                        <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
