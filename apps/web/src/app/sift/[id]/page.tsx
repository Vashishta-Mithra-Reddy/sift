"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSiftAction, completeSessionAction, batchUpdateEchoesAction, createSessionAction, saveSessionAnswersAction, getSiftSessionsAction, getSiftSessionDetailsAction } from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, CheckmarkCircle01Icon, Cancel01Icon, HelpCircleIcon, Loading03Icon, KeyboardIcon, PlayIcon, Time01Icon, ChartHistogramIcon, ViewIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import type { SiftWithQuestions, Question } from "@sift/auth/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import useSound from "use-sound";
import { formatDistanceToNow } from "date-fns";

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
  };  // ... (Keep handleOptionClick, handleCheckAnswer, handleNext logic but adapted) ...


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
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col gap-4">
                <Button variant="ghost" className="w-fit -ml-4 text-muted-foreground" onClick={() => router.push("/dashboard")}>
                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 rotate-180 mr-2" />
                    Back to Library
                </Button>
                <div className="space-y-2">
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
                    <Card className="p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 justify-center items-center flex flex-col">
                        <div className="space-y-6 text-center">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">Ready to practice?</h2>
                                <p className="text-muted-foreground">
                                    Start a new session to test your knowledge and improve mastery.
                                </p>
                            </div>
                            <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 gap-2" onClick={() => handleStartSession(sift.id)}>
                                <HugeiconsIcon icon={PlayIcon} className="h-5 w-5 fill-current" />
                                Start New Session
                            </Button>
                        </div>
                    </Card>

                    {/* Past Sessions List */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <HugeiconsIcon icon={ChartHistogramIcon} className="h-5 w-5" />
                            Past Sessions
                        </h3>
                        {sessions.length > 0 ? (
                            <div className="grid gap-3">
                                {sessions.map((session) => (
                                    <Card key={session.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                                                    session.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                )}>
                                                    {session.status.replace("_", " ")}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDistanceToNow(new Date(session.startedAt))} ago
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {session.score !== null && (
                                                <div className="text-center">
                                                    <span className="block text-2xl font-bold leading-none">{session.score}%</span>
                                                    <span className="text-xs text-muted-foreground">Score</span>
                                                </div>
                                            )}
                                            <Button variant="ghost" size="icon" onClick={() => handleViewSession(session.id)}>
                                                <HugeiconsIcon icon={ViewIcon} className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 border-2 border-dashed rounded-xl text-center text-muted-foreground bg-muted/20">
                                No sessions yet. Start your first one!
                            </div>
                        )}
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
    return (
        <div className="container max-w-4xl mx-auto py-10 space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-8">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="flex justify-center"
                >
                    <div className="p-8 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 ring-8 ring-green-50 dark:ring-green-900/10">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-16 w-16" />
                    </div>
                </motion.div>
                
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">Session Complete!</h1>
                    <p className="text-xl text-muted-foreground">
                        Great job sifting through <span className="font-semibold text-foreground">"{sift.source?.title}"</span>.
                    </p>
                    <div className="py-4">
                        <span className="text-5xl font-black text-primary">{Math.round((correctCount / sift.questions.length) * 100)}%</span>
                        <p className="text-sm text-muted-foreground">Final Score</p>
                    </div>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                    <Button size="lg" onClick={() => setViewMode("details")} className="gap-2">
                        <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 rotate-180" />
                        Back to Sift Details
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => setViewMode("review")}>
                        Review Answers
                    </Button>
                </div>
            </div>
        </div>
    );
  }

  // --- REVIEW VIEW ---
  if (viewMode === "review" && selectedSession) {
      const correctAnswers = selectedSession.answers.filter((a: any) => a.isCorrect).length;
      const totalQuestions = selectedSession.answers.length;

      return (
        <div className="mx-auto pb-10 space-y-8">
            <div className="flex flex-col gap-4">
                <Button variant="ghost" className="w-fit -ml-4 text-muted-foreground" onClick={() => setViewMode("details")}>
                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 rotate-180 mr-2" />
                    Back to Details
                </Button>
                <div className="space-y-2">
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
                                            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5" />
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
                                                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 text-green-600 dark:text-green-400" />
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
        <div className="flex h-screen items-center justify-center flex-col gap-4">
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
    <div className="max-w-7xl mx-auto flex flex-col">
      {/* Header */}
      <div className="mb-8 space-y-4">
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
                <Card className="p-6 md:p-10 min-h-[400px] flex flex-col justify-between border-border/50 bg-card/50 backdrop-blur-sm">
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
                                                            if (isThisCorrect) return <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-green-600" />;
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
                                className="space-y-4 pt-6 border-t"
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
