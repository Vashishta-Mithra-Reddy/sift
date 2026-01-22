"use client";

import { useState, useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Upload01Icon, Loading03Icon, File01Icon, Delete01Icon, TextFontIcon, Link01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { uploadSourceAction, createTextSourceAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface SourceUploaderProps {
  onUploadComplete?: () => void;
  className?: string;
}

import { useRouter } from "next/navigation";

export function SourceUploader({ onUploadComplete, className }: SourceUploaderProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("file");
  const [pastedText, setPastedText] = useState("");
  const [title, setTitle] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      toast.error(`${fileRejections.length} file(s) rejected.`);
    }

    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    const file = acceptedFiles[0]; // Handle one at a time for now

    try {
        const formData = new FormData();
        formData.append("file", file);
        const { siftId } = await uploadSourceAction(formData);
        toast.success(`Uploaded ${file.name}`);
        onUploadComplete?.();
        router.push(`/sift/${siftId}`);
    } catch (error) {
        console.error(error);
        toast.error("Failed to upload file");
    } finally {
        setIsUploading(false);
    }
  }, [onUploadComplete]);

  const handlePasteSubmit = async () => {
    if (!pastedText.trim()) {
        toast.error("Please enter some text");
        return;
    }
    if (!title.trim()) {
        toast.error("Please enter a title");
        return;
    }

    setIsUploading(true);
    try {
        const { siftId } = await createTextSourceAction(title, pastedText);
        toast.success("Content saved and session created");
        
        // Wait briefly for eventual consistency before redirecting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setPastedText("");
        setTitle("");
        onUploadComplete?.();
        // Redirect to the newly created session
        router.push(`/sift/${siftId}`);
    } catch (error) {
        console.error(error);
        toast.error("Failed to save content");
    } finally {
        setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    disabled: isUploading,
    accept: {
      "text/plain": [],
      "text/markdown": [],
      "application/json": [],
      // Add PDF later
    },
  });

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs defaultValue="file" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="file" className="flex items-center gap-2">
                <HugeiconsIcon icon={Upload01Icon} className="h-4 w-4" />
                Upload File
            </TabsTrigger>
            <TabsTrigger value="paste" className="flex items-center gap-2">
                <HugeiconsIcon icon={TextFontIcon} className="h-4 w-4" />
                Paste Text
            </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-0">
            <div
                {...getRootProps()}
                className={cn(
                "relative border-2 bg-card border-dashed rounded-xl p-8 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-4 h-[300px]",
                isDragActive 
                    ? "border-primary bg-card scale-[0.99]" 
                    : "border-border hover:border-primary/50 hover:bg-card",
                isUploading && "opacity-50 cursor-not-allowed"
                )}
            >
                <input {...getInputProps()} />
                <div className={cn(
                    "p-4 rounded-full border shadow-sm transition-colors",
                    isDragActive ? "bg-background" : "bg-muted/50"
                )}>
                    {isUploading ? (
                        <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                        <HugeiconsIcon icon={Upload01Icon} className="h-8 w-8 text-muted-foreground" />
                    )}
                </div>
                <div className="space-y-1">
                <p className="text-base font-medium">
                    {isDragActive ? "Drop to sift..." : "Drop your notes here"}
                </p>
                <p className="text-xs text-muted-foreground">
                    Markdown, Text, JSON
                </p>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="paste" className="mt-0 space-y-4">
            <div className="space-y-4 border rounded-xl p-6 bg-card">
                <div className="space-y-2">
                    <Input 
                        placeholder="Give it a title (e.g. 'History Notes')" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isUploading}
                    />
                </div>
                <div className="space-y-2">
                    <Textarea 
                        placeholder="Paste your notes, article, or raw text here..." 
                        className="min-h-[200px] font-mono text-sm resize-none"
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        disabled={isUploading}
                    />
                </div>
                <div className="flex justify-end">
                    <Button onClick={handlePasteSubmit} disabled={isUploading || !pastedText.trim() || !title.trim()}>
                        {isUploading ? (
                            <>
                                <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Sift It
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
