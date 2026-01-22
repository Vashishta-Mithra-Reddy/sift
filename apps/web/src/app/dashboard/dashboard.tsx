"use client";

import { useState } from "react";
import { SourceUploader } from "@/components/media/source-uploader";
import { getSourcesAction, deleteSourceAction } from "@/app/dashboard/actions";
import type { SourceWithSifts } from "@sift/auth/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon, Delete01Icon, BookOpen01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DashboardProps {
  session: typeof authClient.$Infer.Session;
  initialSources: SourceWithSifts[];
}

export default function Dashboard({ session, initialSources }: DashboardProps) {
  const router = useRouter();
  const [sources, setSources] = useState<SourceWithSifts[]>(initialSources);
  const [loading, setLoading] = useState(false);
  const [creatingSift, setCreatingSift] = useState<string | null>(null);
  const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSources = async () => {
    try {
        const data = await getSourcesAction();
        setSources(data);
    } catch (e) {
        console.error(e);
    }
  };

  const confirmDelete = async () => {
    if (!sourceToDelete) return;
    setIsDeleting(true);
    try {
        await deleteSourceAction(sourceToDelete);
        toast.success("Source deleted");
        fetchSources();
    } catch (e) {
        toast.error("Failed to delete source");
    } finally {
        setIsDeleting(false);
        setSourceToDelete(null);
    }
  };
  
  const handleSift = async (sourceId: string) => {
      const source = sources.find(s => s.id === sourceId);
      
      if (source?.sifts && source.sifts.length > 0) {
          router.push(`/sift/${source.sifts[0].id}`);
          return;
      }

      if (source?.isPasted) {
          // Fallback if no specific sift found but marked as pasted/ready
          router.push("/sifts");
      } else {
          toast.info("AI Generation coming soon!", {
              description: "For uploaded files, use the 'AI Studio' to import generated questions for now."
          });
      }
  };

  return (
    <div className="mx-auto space-y-8 md:px-4">
      <AlertDialog open={!!sourceToDelete} onOpenChange={(open) => !open && setSourceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-full flex flex-col justify-center items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                    <HugeiconsIcon icon={Delete01Icon} className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <AlertDialogTitle className="text-lg font-semibold">Delete Source?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-center text-balance flex flex-col items-center justify-center w-full">
              This will permanently delete this source and all associated sifts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-2 bg-background dark:bg-transparent rounded-xl">
        <h1 className="text-3xl font-bold tracking-tight">Library</h1>
        <p className="text-muted-foreground">
            Manage your knowledge sources and start sifting.
        </p>
      </div>

      <SourceUploader onUploadComplete={fetchSources} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => (
            <Card key={source.id} className="p-4 bg-background flex flex-col justify-between gap-4 group hover:border-primary/50 transition-colors">
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <HugeiconsIcon icon={File01Icon} className="h-6 w-6" />
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setSourceToDelete(source.id)}
                        >
                            <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                        </Button>
                    </div>
                    <div>
                        <h3 className="font-semibold truncate" title={source.title}>{source.title}</h3>
                        <p className="text-xs text-muted-foreground">
                            Added {formatDistanceToNow(new Date(source.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
                
                <Button 
                    className="w-full gap-2" 
                    onClick={() => handleSift(source.id)}
                    disabled={creatingSift === source.id}
                >
                    {creatingSift === source.id ? (
                        <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                    ) : (
                        <HugeiconsIcon icon={BookOpen01Icon} className="h-4 w-4" />
                    )}
                    Sift This
                </Button>
            </Card>
        ))}
        
        {!loading && sources.length === 0 && (
            <div className="col-span-full bg-background text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl font-jakarta">
                No sources yet. Upload one to get started.
            </div>
        )}
      </div>
    </div>
  );
}
