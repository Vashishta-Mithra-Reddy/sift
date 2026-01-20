"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSiftAction, completeSessionAction, batchUpdateEchoesAction, createSessionAction, saveSessionAnswersAction, getSiftSessionsAction, getSiftSessionDetailsAction, deleteSessionAction } from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, CheckmarkCircle02Icon, Cancel01Icon, HelpCircleIcon, Loading03Icon, KeyboardIcon, PlayIcon, Time01Icon, ChartHistogramIcon, ViewIcon, Delete01Icon, Target02Icon, StarIcon, Share01Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogMedia } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { SiftWithQuestions, Question } from "@sift/auth/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import useSound from "use-sound";
import { formatDistanceToNow } from "date-fns";
import { Pie, PieChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function SiftSessionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [sift, setSift] = useState<SiftWithQuestions | undefined>(undefined);
  const [sessions, setSessions] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"details" | "play" | "summary" | "review">("details");
  const [selectedSession, setSelectedSession] = useState<any>(null);
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  // Track performance locally for batch update at the end
  const [performanceData, setPerformanceData] = useState<{ topic: string, level: number }[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [answersToSave, setAnswersToSave] = useState<{ questionId: string; userAnswer: string; isCorrect: boolean }[]>([]);

  // Sounds
  const [playClick] = useSound('/audio/click.wav', { volume: 0.5 });
  const [playSuccess] = useSound('/audio/success.mp3', { volume: 0.5 });
  const [playNotification] = useSound('/audio/notification.wav', { volume: 0.3 });

  const [deletingSession, setDeletingSession] = useState<string | null>(null);

  const pieChartConfig = {
    correct: {
        label: "Correct",
        color: "#22c55e",
    },
    incorrect: {
        label: "Incorrect",
        color: "#ef4444",
    },
  } satisfies ChartConfig;

  const barChartConfig = {
    score: {
        label: "Score",
        color: "hsl(var(--chart-1))",
    }
  } satisfies ChartConfig;

  // Compute chart data from sessions
  const chartData = sessions
    .filter(s => s.status === "completed" && s.score !== null)
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
    .map(s => ({
        date: new Date(s.completedAt).toLocaleDateString(),
        score: s.score
    }));

  const fetchSiftData = useCallback(async () => {
    try {
        const [siftData, sessionsData] = await Promise.all([
            getSiftAction(id),
            getSiftSessionsAction(id)
        ]);
        
        if (!siftData) return;
        setSift(siftData);
        setSessions(sessionsData);
        
        // If coming from a direct "paste" flow, we might want to auto-start.
        // For now, let's default to "details" view unless url param says otherwise?
        // But the previous behavior was auto-start.
        // Let's check if there are any sessions. If 0 sessions, maybe auto-start?
        // Or if the sift was JUST created (less than 1 minute ago).
        
        const isNew = new Date().getTime() - new Date(siftData.createdAt).getTime() < 60000;
        if (isNew && sessionsData.length === 0) {
            handleStartSession(siftData.id);
        }

    } catch (e) {
        console.error(e);
        toast.error("Failed to load session");
    } finally {
        setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSiftData();
    
    // Polling only if waiting for questions in details view
    const intervalId = setInterval(async () => {
        if (!sift || (sift.questions && sift.questions.length > 0)) return;
        fetchSiftData();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [fetchSiftData, sift?.questions?.length]);

  const handleStartSession = async (siftId: string) => {
      setLoading(true);
      try {
          const newSessionId = await createSessionAction(siftId);
          setSessionId(newSessionId);
          setViewMode("play");
          setCurrentQuestionIndex(0);
          setCorrectCount(0);
          setPerformanceData([]);
          setCompleted(false);
      } catch (e) {
          toast.error("Failed to start session");
      } finally {
          setLoading(false);
      }
  };



  const handleViewSession = async (sessionId: string) => {
    setLoading(true);
    try {
        const details = await getSiftSessionDetailsAction(sessionId);
        setSelectedSession(details);
        setViewMode("review");
    } catch (e) {
        toast.error("Failed to load session details");
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
      setDeletingSession(sessionId);
      try {
          await deleteSessionAction(sessionId);
          toast.success("Session deleted");
          fetchSiftData();
      } catch (e) {
          toast.error("Failed to delete session");
      } finally {
          setDeletingSession(null);
      }
  };

  const handleOptionClick = useCallback((option: string) => {
    if (showAnswer) return; 
    playClick();
    setSelectedOption(option);
  }, [showAnswer, playClick]);

  const handleCheckAnswer = useCallback(() => {
    if (!selectedOption || !sift) return;
    
    setShowAnswer(true);
    
    // Determine correctness for sound
    const currentQ = sift.questions[currentQuestionIndex];
    let isCorrect = false;
    if (currentQ.correctOption && currentQ.options) {
        const correctIndex = currentQ.correctOption.charCodeAt(0) - 65;
        const selectedIndex = (currentQ.options as string[]).indexOf(selectedOption);
        isCorrect = correctIndex === selectedIndex;
    } else {
        isCorrect = selectedOption === currentQ.answer;
    }

    if (isCorrect) {
        playSuccess();
    } else {
        playNotification(); // Error sound placeholder
    }
  }, [selectedOption, sift, currentQuestionIndex, playSuccess, playNotification]);

  const handleNext = useCallback(async () => {
    if (!sift || !sift.source) return;

    playClick();
    const currentQ = sift.questions[currentQuestionIndex];
    
    let isCorrect = false;
    if (currentQ.correctOption && currentQ.options) {
        const correctIndex = currentQ.correctOption.charCodeAt(0) - 65;
        const selectedIndex = (currentQ.options as string[]).indexOf(selectedOption || "");
        isCorrect = correctIndex === selectedIndex;
    } else {
        isCorrect = selectedOption === currentQ.answer;
    }

    if (isCorrect) {
        setCorrectCount(prev => prev + 1);
    }

    // Save answer locally to batch push later (or push now)
    // Pushing now is safer for "resume" later, but for now we do "complete at end".
    // Actually, let's push answer now so we don't lose progress if browser crashes.
    if (sessionId) {
        saveSessionAnswersAction(sessionId, [{
            questionId: currentQ.id,
            userAnswer: selectedOption || "",
            isCorrect
        }]).catch(console.error);
    }

    const mastery = isCorrect ? 100 : 0;
    
    // Improved Topic Extraction: Use tags if available, otherwise simplified question text
    let topic = "General";
    if (currentQ.tags && currentQ.tags.length > 0) {
        topic = currentQ.tags[0]; // Primary tag
    } else {
        // Fallback: Strip common words or just take first 50 chars
        topic = currentQ.question.substring(0, 50) + (currentQ.question.length > 50 ? "..." : "");
    }
    
    // Accumulate performance data locally
    setPerformanceData(prev => [...prev, { topic, level: mastery }]);

    if (currentQuestionIndex < sift.questions.length - 1) {
       setCurrentQuestionIndex(prev => prev + 1);
       setShowAnswer(false);
       setSelectedOption(null);
    } else {
       // End of session
       try {
           // Calculate final score based on updated count (need to include current question)
           // Since setCorrectCount is async, we can't rely on `correctCount` state directly for the *final* calculation including this turn.
           // So we use (correctCount + (isCorrect ? 1 : 0))
           const finalCorrectCount = correctCount + (isCorrect ? 1 : 0);
           const finalScore = Math.round((finalCorrectCount / sift.questions.length) * 100);

           // 1. Mark Session as complete with score
           if (sessionId) {
               await completeSessionAction(sessionId, finalScore);
           }
           
           // 2. Batch update echoes (Mastery)
           const mergedUpdates = [...performanceData, { topic, level: mastery }];
           await batchUpdateEchoesAction(sift.sourceId, mergedUpdates);
           
           setCompleted(true);
           setViewMode("summary"); // Update view mode
           playSuccess(); // Celebration sound
           
           // Fetch and set details for immediate review
           if (sessionId) {
             getSiftSessionDetailsAction(sessionId).then(details => {
                 setSelectedSession(details);
             });
           }
           
           // Refresh sessions list in background
           fetchSiftData();
       } catch (error) {
           console.error("Failed to complete session", error);
           toast.error("Failed to save progress");
       }
    }
  }, [sift, currentQuestionIndex, selectedOption, id, playClick, playSuccess, performanceData, correctCount, sessionId, fetchSiftData]);

  // Keyboard Shortcuts (Only active in Play mode)
  useEffect(() => {
    if (viewMode !== "play") return;
    const handleKeyDown = (e: KeyboardEvent) => {
        if (loading || completed || !sift) return;
        
        const currentQ = sift.questions?.[currentQuestionIndex];
        if (!currentQ) return;
        
        const options = (currentQ?.options as string[]) || [];

        if (!showAnswer) {
            if (e.key === 'Enter' && selectedOption) {
                handleCheckAnswer();
            }
            if (options.length >= 1 && (e.key === 'a' || e.key === 'A' || e.key === '1')) handleOptionClick(options[0]);
            if (options.length >= 2 && (e.key === 'b' || e.key === 'B' || e.key === '2')) handleOptionClick(options[1]);
            if (options.length >= 3 && (e.key === 'c' || e.key === 'C' || e.key === '3')) handleOptionClick(options[2]);
            if (options.length >= 4 && (e.key === 'd' || e.key === 'D' || e.key === '4')) handleOptionClick(options[3]);
        } else {
            if (e.key === 'Enter') {
                handleNext();
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, completed, sift, currentQuestionIndex, showAnswer, selectedOption, handleOptionClick, handleCheckAnswer, handleNext, viewMode]);


  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center flex-col gap-4">
            <HugeiconsIcon icon={Loading03Icon} className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Loading your sift...</p>
        </div>
    );
  }

  if (!sift) {
      return (
        <div className="flex h-screen items-center justify-center flex-col gap-4">
            <div className="p-4 bg-destructive/10 rounded-full text-destructive">
                <HugeiconsIcon icon={Cancel01Icon} className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold">Sift Not Found</h2>
            <Button onClick={() => router.push("/dashboard")}>Return to Library</Button>
        </div>
      );
  }

  // --- DETAILS VIEW (Default) ---
  if (viewMode === "details") {
      return (
        <div className="max-w-7xl mx-auto space-y-8 md:px-4">
            <div className="flex flex-col gap-2">
                <Button variant="ghost" className="w-fit -ml-4 text-muted-foreground" onClick={() => router.push("/dashboard")}>
                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 rotate-180 mr-2" />
                    Back to Library
                </Button>
                <div className="space-y-2 bg-background dark:bg-transparent rounded-xl">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{sift.source?.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <HugeiconsIcon icon={HelpCircleIcon} className="h-4 w-4" />
                            {sift.questions.length} Questions
                        </span>
                        <span className="flex items-center gap-1">
                            <HugeiconsIcon icon={Time01Icon} className="h-4 w-4" />
                            Created {formatDistanceToNow(new Date(sift.createdAt))} ago
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-3 space-y-8">
                    {/* Hero Card */}
                    <Card className="p-8 border-primary/20 justify-center items-center flex flex-col font-jakarta">
                        <div className="space-y-6 text-center">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">Ready to practice?</h2>
                                <p className="text-lg text-muted-foreground">
                                    Start a new session to test your knowledge and improve mastery.
                                </p>
                            </div>
                            <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 gap-2" onClick={() => handleStartSession(sift.id)}>
                                <HugeiconsIcon icon={PlayIcon} className="h-5 w-5 fill-current" />
                                Start New Quiz
                            </Button>
                        </div>
                    </Card>

                    {/* Past Sessions List */}
                    <div className="space-y-4">
                        {/* <h3 className="text-lg font-semibold flex items-center gap-2">
                            <HugeiconsIcon icon={ChartHistogramIcon} className="h-5 w-5" />
                            Performance History
                        </h3> */}

                        {/* Performance Chart */}
                        {chartData.length > 0 && (
                            <Card className="font-jakarta">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <HugeiconsIcon icon={ChartHistogramIcon} className="h-5 w-5" />
                                        Performance History
                                    </CardTitle>
                                    <CardDescription>
                                        {chartData.length > 1 
                                            ? `Last ${chartData.length} sessions performance`
                                            : "Latest session performance"
                                        }
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="h-[40vh]">
                                    <ChartContainer className="h-[40vh] pt-6 pb-2 w-full" config={barChartConfig}>
                                        <BarChart accessibilityLayer data={chartData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis 
                                                dataKey="date" 
                                                tickLine={false} 
                                                tickMargin={10} 
                                                axisLine={false} 
                                                tickFormatter={(value) => value} 
                                            />
                                            <YAxis 
                                                tickLine={false} 
                                                axisLine={false} 
                                                domain={[0, 100]} 
                                                tickMargin={10}
                                            />
                                            <ChartTooltip 
                                                cursor={false} 
                                                content={<ChartTooltipContent hideLabel />} 
                                            />
                                            <Bar dataKey="score" fill="var(--chart-1)" radius={8} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                                <CardFooter className="flex-col items-start gap-2 text-sm">
                                    <div className="flex gap-2 leading-none font-medium">
                                        {chartData.length > 1 ? (
                                            <>
                                                {(() => {
                                                    const last = chartData[chartData.length - 1].score;
                                                    const prev = chartData[chartData.length - 2].score;
                                                    const diff = last - prev;
                                                    return diff > 0 
                                                        ? `Trending up by ${diff}%` 
                                                        : diff < 0 
                                                            ? `Trending down by ${Math.abs(diff)}%` 
                                                            : "Maintained same score";
                                                })()}
                                                {/* <HugeiconsIcon icon={ChartHistogramIcon} className="h-4 w-4" /> */}
                                            </>
                                        ) : (
                                            "Complete more sessions to see trends"
                                        )}
                                    </div>
                                    <div className="text-muted-foreground leading-none">
                                        Showing total scores for the last {chartData.length} sessions
                                    </div>
                                </CardFooter>
                            </Card>
                        )}

                        <Card className="font-jakarta">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <HugeiconsIcon icon={Time01Icon} className="h-5 w-5 text-muted-foreground" />
                                            Session History
                                        </CardTitle>
                                        <CardDescription>
                                            Your recent practice sessions and scores
                                        </CardDescription>
                                    </div>
                                    {sessions.length > 0 && (
                                        <Badge variant="outline" className="px-3 py-1 h-7">
                                            {sessions.length} Session{sessions.length !== 1 ? 's' : ''}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {sessions.length > 0 ? (
                                    <ScrollArea className="h-[400px] pr-4">
                                        <div className="space-y-4">
                                            {sessions.map((session) => (
                                                <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "h-11 w-14 px-8 rounded-xl flex items-center justify-center border-2 shrink-0",
                                                            session.status === "completed" 
                                                                ? (session.score >= 80 ? "bg-green-100 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400" 
                                                                : session.score >= 50 ? "bg-yellow-100 border-yellow-200 text-yellow-600 dark:bg-yellow-900/20 dark:border-yellow-900/50 dark:text-yellow-400"
                                                                : "bg-red-100 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400")
                                                                : "bg-muted border-muted-foreground/20 text-muted-foreground"
                                                        )}>
                                                            {session.status === "completed" ? (
                                                                <span className="font-bold text-sm">{session.score}%</span>
                                                            ) : (
                                                                <HugeiconsIcon icon={PlayIcon} className="h-5 w-5 fill-current" />
                                                            )}
                                                        </div>
                                                        
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-medium leading-none">
                                                                    {session.status === "completed" ? "Completed Session" : "Incomplete Session"}
                                                                </h4>
                                                                {session.status === "completed" && session.score >= 90 && (
                                                                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 h-5 text-[10px] px-1.5">
                                                                        Excellent
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <HugeiconsIcon icon={Time01Icon} className="h-3 w-3" />
                                                                    {formatDistanceToNow(new Date(session.startedAt))} ago
                                                                </span>
                                                                <span>•</span>
                                                                <span>
                                                                    {new Date(session.startedAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleViewSession(session.id)}>
                                                            <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" />
                                                            <span className="sr-only">View</span>
                                                        </Button>
                                                        
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                                    disabled={deletingSession === session.id}
                                                                >
                                                                    {deletingSession === session.id ? (
                                                                        <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                                                                    )}
                                                                    <span className="sr-only">Delete</span>
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="font-jakarta">
                                                                <AlertDialogHeader>
                                                                    <div className="w-full flex flex-col justify-center items-center gap-2">
                                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                                                            <HugeiconsIcon icon={Delete01Icon} className="h-6 w-6 text-red-600 dark:text-red-400" />
                                                                        </div>
                                                                        <AlertDialogTitle className="text-lg font-semibold">Delete Session?</AlertDialogTitle>
                                                                    </div>
                                                                    <AlertDialogDescription className="text-center text-balance flex flex-col items-center justify-center w-full">
                                                                        Are you sure you want to delete this session? <br/> This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction 
                                                                        onClick={() => handleDeleteSession(session.id)}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                        <div className="p-4 rounded-full bg-muted/50">
                                            <HugeiconsIcon icon={ChartHistogramIcon} className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg">No sessions yet</h3>
                                            <p className="text-muted-foreground text-sm max-w-[250px]">
                                                Start your first practice session to begin tracking your progress.
                                            </p>
                                        </div>
                                        <Button onClick={() => handleStartSession(sift.id)} variant="outline" className="mt-2">
                                            Start Session
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Sidebar Stats (Placeholder) */}
                <div className="space-y-6">
                    {/* Add global mastery stats here later */}
                </div>
            </div>
        </div>
      );
  }

  // --- SUMMARY VIEW ---
  if (viewMode === "summary") {
    const accuracy = Math.round((correctCount / sift.questions.length) * 100);
    const incorrectCount = sift.questions.length - correctCount;

    return (
        <div className="flex items-center justify-center p-0 h-full animate-in fade-in zoom-in duration-300">
            <Card className="w-full max-w-5xl grid md:grid-cols-2 overflow-hidden border-0 ring-1 ring-border py-0">
                {/* Left Column: Score & Chart */}
                <div className="flex flex-col items-center justify-center p-8 md:p-12 space-y-8 text-center relative overflow-hidden">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="relative z-10"
                    >
                        <div className="relative">
                            <ChartContainer config={pieChartConfig} className="aspect-square h-[240px] w-[240px]">
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Pie
                                        data={[
                                            { name: 'correct', value: correctCount, fill: "var(--color-correct)" },
                                            { name: 'incorrect', value: incorrectCount, fill: "var(--color-incorrect)" },
                                        ]}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={80}
                                        outerRadius={110}
                                        strokeWidth={0}
                                        cornerRadius={4}
                                        paddingAngle={2}
                                    />
                                </PieChart>
                            </ChartContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-center"
                                >
                                    <span className="text-5xl font-bold tracking-tighter block">{accuracy}%</span>
                                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-1 block">Accuracy</span>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                    
                    <div className="space-y-2 relative z-10">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {accuracy >= 80 ? "Outstanding!" :
                             accuracy >= 50 ? "Good Job!" :
                             "Keep Practicing!"}
                        </h1>
                        <p className="text-muted-foreground max-w-[250px] mx-auto">
                            You've completed <span className="font-semibold text-foreground">"{sift.source?.title}"</span>
                        </p>
                    </div>
                </div>

                {/* Right Column: Stats & Actions */}
                <div className="flex flex-col p-8 md:p-12 space-y-8 bg-card">
                    <div className="flex-1 grid grid-cols-1 gap-4 content-center">
                        <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/20">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Correct Answers</p>
                                <p className="text-2xl font-bold">{correctCount}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/20">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                                <HugeiconsIcon icon={Cancel01Icon} className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Incorrect Answers</p>
                                <p className="text-2xl font-bold">{incorrectCount}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/20">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                <HugeiconsIcon icon={Target02Icon} className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Questions</p>
                                <p className="text-2xl font-bold">{sift.questions.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button size="lg" onClick={() => setViewMode("details")} variant="outline" className="h-14 text-base">
                            <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5 rotate-180 mr-2" />
                            Return
                        </Button>
                        <Button size="lg" onClick={() => setViewMode("review")} className="h-14 text-base">
                            Review
                            <HugeiconsIcon icon={ViewIcon} className="h-5 w-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
  }

  // --- REVIEW VIEW ---
  if (viewMode === "review" && selectedSession) {
      const correctAnswers = selectedSession.answers.filter((a: any) => a.isCorrect).length;
      const totalQuestions = selectedSession.answers.length;

      return (
        <div className="mx-auto pb-10 space-y-8 md:px-3">
            <div className="flex flex-col gap-2">
                <Button variant="ghost" className="w-fit -ml-4 text-muted-foreground bg-background" onClick={() => setViewMode("details")}>
                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 rotate-180 mr-2" />
                    Back to Details
                </Button>
                <div className="space-y-2 bg-background dark:bg-transparent rounded-xl">
                    <h1 className="text-3xl font-bold tracking-tight">Session Review</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <HugeiconsIcon icon={Time01Icon} className="h-4 w-4" />
                            Completed {formatDistanceToNow(new Date(selectedSession.completedAt || selectedSession.startedAt))} ago
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-primary">
                            Score: {selectedSession.score}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {selectedSession.answers.map((answer: any, idx: number) => {
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

  // --- PLAY VIEW (Existing Quiz Logic) ---
  // Ensure currentQ exists before rendering Play View
  const currentQ = sift.questions?.[currentQuestionIndex];

  if (!currentQ && viewMode === "play") {
    return (
        <div className="flex h-screen items-center justify-center flex-col gap-4 md:px-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
                <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold">Generating Questions...</h2>
            <p className="text-muted-foreground text-center max-w-md">
                We're analyzing your content and generating high-quality questions. This might take a moment.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>Check Again</Button>
        </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / sift.questions.length) * 100;
  const options = (currentQ?.options as string[]) || []; 

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:px-4">
      {/* Header */}
      <div className="mb-2 space-y-4 bg-background dark:bg-transparent rounded-xl px-4 py-3 border border-border/0">
        <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground truncate max-w-[200px] md:max-w-md" title={sift.source?.title}>
                {sift.source?.title}
            </span>
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs font-medium">
                <span>{currentQuestionIndex + 1}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{sift.questions.length}</span>
            </div>
        </div>
        <Progress value={progress} className="h-2 w-full transition-all duration-500" />
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
            <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
            >
                <Card className="p-6 md:p-8 md:pb-8 min-h-[400px] flex flex-col justify-between border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="space-y-8">
                        <h2 className="text-xl md:text-3xl font-bold leading-tight tracking-tight">
                            {currentQ?.question}
                        </h2>

                        <div className="grid gap-3">
                            {options.length > 0 ? (
                                options.map((option, idx) => {
                                    let className = "relative justify-start text-left h-auto py-4 px-6 text-base font-normal transition-all duration-200 group";
                                    const letter = String.fromCharCode(65 + idx);
                                    
                                    if (showAnswer) {
                                        // Logic for showing correct/incorrect
                                        let isThisCorrect = false;
                                        if (currentQ?.correctOption) {
                                            isThisCorrect = letter === currentQ.correctOption;
                                        } else {
                                            isThisCorrect = option === currentQ?.answer;
                                        }

                                        let isThisSelected = option === selectedOption;

                                        if (isThisCorrect) {
                                            className += " bg-green-500/10 border-green-500 text-green-800 dark:text-green-400 ring-1 ring-green-500";
                                        } else if (isThisSelected && !isThisCorrect) {
                                            className += " bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 ring-1 ring-red-500";
                                        } else {
                                            className += " opacity-50 grayscale";
                                        }
                                    } else {
                                        if (selectedOption === option) {
                                            className += " border-primary bg-primary/5 ring-1 ring-primary";
                                        } else {
                                            className += " hover:bg-muted hover:border-primary/50";
                                        }
                                    }

                                    return (
                                        <Button
                                            key={idx}
                                            variant="outline"
                                            className={className}
                                            onClick={() => handleOptionClick(option)}
                                            disabled={showAnswer}
                                        >
                                            <div className="flex items-center gap-4 w-full">
                                                <span className={cn(
                                                    "flex items-center justify-center h-6 w-6 rounded-md border text-xs font-mono transition-colors",
                                                    selectedOption === option ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground bg-muted/20"
                                                )}>
                                                    {letter}
                                                </span>
                                                <span className="flex-1">{option}</span>
                                                {showAnswer && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                        {(() => {
                                                            let isThisCorrect = false;
                                                            if (currentQ?.correctOption) {
                                                                isThisCorrect = letter === currentQ.correctOption;
                                                            } else {
                                                                isThisCorrect = option === currentQ?.answer;
                                                            }
                                                            if (isThisCorrect) return <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-green-600" />;
                                                            if (option === selectedOption) return <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5 text-red-600" />;
                                                            return null;
                                                        })()}
                                                    </motion.div>
                                                )}
                                            </div>
                                        </Button>
                                    );
                                })
                            ) : (
                                <div className="p-8 border-2 border-dashed rounded-xl text-muted-foreground text-center bg-muted/20">
                                    No options provided for this question.
                                </div>
                            )}
                        </div>
                        
                        {showAnswer && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 pt-6 border-t border-dashed"
                            >
                                {currentQ?.explanation && (
                                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 text-sm flex gap-3">
                                        <HugeiconsIcon icon={HelpCircleIcon} className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <span className="font-semibold text-blue-700 dark:text-blue-400 block">Explanation</span>
                                            <span className="text-blue-600/90 dark:text-blue-400/80 leading-relaxed">{currentQ.explanation}</span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    <div className={cn("pt-6 flex items-center justify-between", showAnswer ? "pt-4" : "")}>
                        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                            <HugeiconsIcon icon={KeyboardIcon} className="h-4 w-4" />
                            <span>Press <kbd className="bg-muted px-1 rounded border">A-D</kbd> to select, <kbd className="bg-muted px-1 rounded border">Enter</kbd> to confirm</span>
                        </div>
                        
                        <div className="flex-1 md:flex-none flex justify-end">
                            {!showAnswer ? (
                                <Button 
                                    size="lg" 
                                    className="w-full md:w-auto text-base h-12 px-8 transition-all" 
                                    onClick={handleCheckAnswer}
                                    disabled={!selectedOption}
                                >
                                    Check Answer
                                </Button>
                            ) : (
                                <Button 
                                    size="lg" 
                                    className="w-full md:w-auto text-base h-12 px-8 gap-2 transition-all"
                                    onClick={handleNext}
                                >
                                    Next Question
                                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
