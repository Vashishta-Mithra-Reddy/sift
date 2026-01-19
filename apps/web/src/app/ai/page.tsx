"use client";

import { useCompletion } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, CheckmarkCircle02Icon, MagicWand01Icon, Upload01Icon, FlashIcon, PlayIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { createImportedSourceAction } from "@/app/dashboard/actions";
import { useRouter } from "next/navigation";

const SYSTEM_PROMPT = `You are Sift AI, an expert at creating active recall study materials.
Your task is to analyze the provided text and generate a set of high-quality Multiple Choice Questions (MCQ).

Output Format: JSON Array
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "The correct option text (must match one of the options exactly)",
    "correctOption": "A", // The letter of the correct option (A, B, C, or D)
    "explanation": "Why this is the answer",
    "tags": ["tag1", "tag2"]
  }
]

Rules:
1. Focus on key concepts and facts.
2. Provide exactly 4 options for each question.
3. Ensure there is only one correct answer.
4. Keep explanations concise but helpful.
5. Output ONLY the JSON array, no other text.`;

export default function AIPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [importTitle, setImportTitle] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Direct Generate State
  const [topic, setTopic] = useState("");
  const [planMode, setPlanMode] = useState(false);
  const [plan, setPlan] = useState("");
  const [showPlanReview, setShowPlanReview] = useState(false);

  // Plan Generator
  const { complete: generatePlan, completion: planStream, isLoading: isPlanning, setCompletion: setPlanCompletion } = useCompletion({
    api: "/api/ai/generate",
    body: { mode: "plan" },
    streamProtocol: "text",
    onFinish: (_prompt, result) => {
        setPlan(result);
        setShowPlanReview(true);
    },
    onError: (err) => {
        console.error("Plan generation error:", err);
        toast.error("Failed to generate plan. Please try again.");
    }
  });

  // Question Generator
  const { complete: generateQuestions, completion: questionsStream, isLoading: isGeneratingQuestions } = useCompletion({
    api: "/api/ai/generate",
    body: { mode: "questions" },
    streamProtocol: "text",
    onFinish: async (_prompt, result) => {
        try {
            const cleaned = result.replace(/```json/g, "").replace(/```/g, "").trim();
            const questions = JSON.parse(cleaned);
            const { siftId } = await createImportedSourceAction(topic || "AI Generated Sift", questions);
            toast.success("Sift created!");
            router.push(`/sift/${siftId}`);
        } catch (e) {
            console.error(e);
            toast.error("Failed to parse AI response. Try again.");
        }
    },
    onError: (err) => {
        console.error("Question generation error:", err);
        toast.error("Failed to generate questions. Please try again.");
    }
  });

  const handleStartGenerate = () => {
    if (!topic.trim()) return toast.error("Enter a topic");
    
    // Reset states
    setShowPlanReview(false);
    setPlan("");
    setPlanCompletion(""); // Clear previous stream
    
    if (planMode) {
        generatePlan(topic);
    } else {
        generateQuestions(topic);
    }
  };

  const handleContinueWithPlan = () => {
      generateQuestions(plan);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(SYSTEM_PROMPT);
    setCopied(true);
    toast.success("System prompt copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    if (!jsonInput.trim() || !importTitle.trim()) {
        toast.error("Please provide a title and JSON content");
        return;
    }

    try {
        const questions = JSON.parse(jsonInput);
        if (!Array.isArray(questions)) {
            throw new Error("Input must be a JSON array");
        }
        
        setIsImporting(true);
        const { siftId } = await createImportedSourceAction(importTitle, questions);
        toast.success("Questions imported successfully");
        router.push(`/sift/${siftId}`);
    } catch (e) {
        console.error(e);
        toast.error("Invalid JSON format");
    } finally {
        setIsImporting(false);
    }
  };

  return (
    <div className="max-w-5xl py-6 mx-auto space-y-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">AI Studio</h1>
            <p className="text-muted-foreground">
                Generate perfect study materials using your favorite LLM.
            </p>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="generate" className="gap-2">
                    <HugeiconsIcon icon={FlashIcon} className="h-4 w-4" />
                    Direct Generate
                </TabsTrigger>
                <TabsTrigger value="prompt" className="gap-2">
                    <HugeiconsIcon icon={MagicWand01Icon} className="h-4 w-4" />
                    Get Prompt
                </TabsTrigger>
                <TabsTrigger value="import" className="gap-2">
                    <HugeiconsIcon icon={Upload01Icon} className="h-4 w-4" />
                    Import JSON
                </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Generate from Topic</CardTitle>
                        <CardDescription>
                            Enter a topic and let Sift AI create a comprehensive quiz for you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Topic</Label>
                                <Input 
                                    placeholder="e.g.React Hooks, Photosynthesis, World War II,..." 
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    disabled={isPlanning || isGeneratingQuestions}
                                />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <Switch 
                                    id="plan-mode" 
                                    checked={planMode} 
                                    onCheckedChange={setPlanMode}
                                    disabled={isPlanning || isGeneratingQuestions}
                                />
                                <Label htmlFor="plan-mode">Plan Mode (Review outline before generating)</Label>
                            </div>

                            {!showPlanReview && !isGeneratingQuestions && !isPlanning && (
                                <Button onClick={handleStartGenerate} className="gap-2">
                                    <HugeiconsIcon icon={MagicWand01Icon} className="h-4 w-4" />
                                    Generate
                                </Button>
                            )}
                        </div>

                        {/* Streaming Output / Plan Review */}
                        {(isPlanning || showPlanReview) && (
                            <div className="space-y-4 pt-4 border-t">
                                <Label>Study Plan</Label>
                                {/* {isPlanning ? ( */}
                                    <div contentEditable={!isPlanning} style={{ outline: 'none' }} className="py-4 px-6 rounded-lg border bg-card text-card-foreground min-h-[200px] text-sm max-h-[500px] overflow-y-auto">
                                        <Streamdown>
                                            {planStream || "Generating plan..."}
                                        </Streamdown>
                                    </div>
                                {/* ) : (
                                    <Textarea 
                                        defaultValue={plan} 
                                        onChange={(e) => setPlan(e.target.value)} 
                                        className="min-h-[300px] font-mono text-sm"
                                    />
                                )}
                                */}
                                
                                {showPlanReview && (
                                    <Button onClick={handleContinueWithPlan} className="gap-2 w-full">
                                        <HugeiconsIcon icon={PlayIcon} className="h-4 w-4" />
                                        Continue to Generate Questions
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Question Generation Progress */}
                        {isGeneratingQuestions && (
                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center gap-2 text-primary animate-pulse">
                                    <HugeiconsIcon icon={MagicWand01Icon} className="h-5 w-5" />
                                    <span className="font-medium">Generating Questions...</span>
                                </div>
                                <div className="p-4 rounded-lg border bg-muted/50 max-h-[200px] overflow-hidden opacity-50 text-xs font-mono">
                                    {questionsStream}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="prompt" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>System Prompt</CardTitle>
                        <CardDescription>
                            Copy this prompt and paste it into ChatGPT, Claude, or Gemini along with your notes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative rounded-md bg-muted p-4 font-mono text-sm">
                            <pre className="whitespace-pre-wrap">{SYSTEM_PROMPT}</pre>
                            <Button 
                                size="icon" 
                                variant="secondary" 
                                className="absolute top-4 right-4 h-8 w-8"
                                onClick={handleCopyPrompt}
                            >
                                {copied ? (
                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-green-500" />
                                ) : (
                                    <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p className="font-semibold">Instructions:</p>
                            <ol className="list-decimal list-inside space-y-1 mt-2">
                                <li>Copy the prompt above.</li>
                                <li>Paste it into your LLM of choice.</li>
                                <li>Paste your notes/text after the prompt.</li>
                                <li>Copy the JSON response it generates.</li>
                                <li>Come back here and switch to the "Import JSON" tab.</li>
                            </ol>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Import Questions</CardTitle>
                        <CardDescription>
                            Paste the JSON generated by the LLM here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input 
                                placeholder="e.g. Biology Chapter 1 Questions" 
                                value={importTitle}
                                onChange={(e) => setImportTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">JSON Content</label>
                            <Textarea 
                                placeholder='[{"question": "...", "answer": "..."}]'
                                className="font-mono min-h-[300px]"
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                            />
                        </div>
                        <Button className="w-full" onClick={handleImport} disabled={isImporting}>
                            {isImporting ? "Importing..." : "Import Questions"}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
