"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSiftSessionDetailsAction } from "../../actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Time01Icon, CheckmarkCircle02Icon, Cancel01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function SiftSessionReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string; // This is the session ID

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
        try {
            const details = await getSiftSessionDetailsAction(id);
            if (!details) {
                toast.error("Session not found");
                router.push("/dashboard");
                return;
            }
            setSession(details);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load session details");
        } finally {
            setLoading(false);
        }
    };
    fetchSession();
  }, [id, router]);

  if (loading) {
    return (
        <div className="flex h-full items-center justify-center flex-col gap-4">
            <HugeiconsIcon icon={Loading03Icon} className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Loading session review...</p>
        </div>
    );
  }

  if (!session) return null;

  return (
    <div className="mx-auto pb-10 space-y-8 px-0 md:px-4">
        <div className="flex flex-col gap-2 px-2 md:px-0">
            <Button variant="ghost" className="hidden md:flex w-fit -ml-4 text-muted-foreground bg-background" onClick={() => router.push(`/sift/${session.siftId}`)}>
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 rotate-180 mr-2" />
                Back to Details
            </Button>
            <div className="space-y-2 bg-background dark:bg-transparent rounded-xl">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Session Review</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Time01Icon} className="h-4 w-4" />
                        Completed {formatDistanceToNow(new Date(session.completedAt || session.startedAt))} ago
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                        Score: {session.score}%
                    </span>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            {session.answers.map((answer: any, idx: number) => {
                const question = answer.question;
                const isCorrect = answer.isCorrect;
                
                return (
                    <Card key={answer.id} className={cn(
                        "p-6",
                        isCorrect ? "" : ""
                    )}>
                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <h3 className="text-lg font-semibold leading-tight">
                                    <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                                    {question.question}
                                </h3>
                                {isCorrect ? (
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5" />
                                    </div>
                                ) : (
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                                        <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" />
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-2">
                                {question.options && question.options.length > 0 ? (
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {question.options.map((option: string, optIdx: number) => {
                                            const isSelected = option === answer.userAnswer;
                                            const isCorrectOption = option === question.answer;
                                            const letter = String.fromCharCode(65 + optIdx);
                                            
                                            let cardClassName = "relative p-3 rounded-lg border flex items-start gap-3 transition-colors";
                                            
                                            if (isSelected && isCorrect) {
                                                cardClassName += " bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30 text-green-900 dark:text-green-100";
                                            } else if (isSelected && !isCorrect) {
                                                cardClassName += " bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-900 dark:text-red-100";
                                            } else if (isCorrectOption && !isCorrect) {
                                                cardClassName += " bg-green-50/50 dark:bg-green-900/5 border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-200";
                                            } else {
                                                cardClassName += "border-1 border-border bg-muted/20 opacity-60";
                                            }

                                            return (
                                                <div key={optIdx} className={cardClassName}>
                                                    <span className={cn(
                                                        "flex-shrink-0 flex items-center justify-center h-5 w-5 rounded border text-[10px] font-mono mt-0.5",
                                                        isSelected || isCorrectOption 
                                                            ? "border-current bg-current/10" 
                                                            : "border-muted-foreground/30 text-muted-foreground"
                                                    )}>
                                                        {letter}
                                                    </span>
                                                    <span className="text-sm font-medium leading-tight pt-0.5">{option}</span>
                                                    
                                                    {isSelected && (
                                                        <span className="absolute top-2 right-2 flex h-2 w-2">
                                                            <span className={cn(
                                                                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                                                isCorrect ? "bg-green-500" : "bg-red-500"
                                                            )}></span>
                                                            <span className={cn(
                                                                "relative inline-flex rounded-full h-2 w-2",
                                                                isCorrect ? "bg-green-500" : "bg-red-500"
                                                            )}></span>
                                                        </span>
                                                    )}
                                                    
                                                    {isCorrectOption && !isSelected && (
                                                        <div className="absolute top-2 right-2">
                                                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    // Fallback for non-MCQ or missing options (legacy support)
                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-1">
                                            <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Your Answer</span>
                                            <div className={cn(
                                                "p-3 rounded-lg border font-medium",
                                                isCorrect ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400"
                                            )}>
                                                {answer.userAnswer}
                                            </div>
                                        </div>
                                        {!isCorrect && (
                                            <div className="space-y-1">
                                                <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Correct Answer</span>
                                                <div className="p-3 rounded-lg border bg-muted/50 font-medium">
                                                    {question.answer}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {question.explanation && (
                                <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                                    <span className="font-semibold block mb-1">Explanation:</span>
                                    {question.explanation}
                                </div>
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    </div>
  );
}
