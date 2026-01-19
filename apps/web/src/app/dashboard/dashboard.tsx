"use client";

import { useEffect, useState } from "react";
import { SourceUploader } from "@/components/media/source-uploader";
import { getSourcesAction, deleteSourceAction } from "@/app/dashboard/actions";
import type { Source } from "@sift/auth/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon, Delete01Icon, BookOpen01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface DashboardProps {
  session: typeof authClient.$Infer.Session;
}

export default function Dashboard({ session }: DashboardProps) {
  const router = useRouter();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingSift, setCreatingSift] = useState<string | null>(null);

  const fetchSources = async () => {
    try {
        const data = await getSourcesAction();
        setSources(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleDelete = async (id: string) => {
    try {
        await deleteSourceAction(id);
        toast.success("Source deleted");
        fetchSources();
    } catch (e) {
        toast.error("Failed to delete source");
    }
  };
  
  const handleSift = async (sourceId: string) => {
      // In a real app, this would trigger AI generation.
      // For now, since we only have "Import" working fully end-to-end with questions,
      // we'll just show a toast or redirect to a placeholder if it's not an imported source.
      
      const source = sources.find(s => s.id === sourceId);
      
      // If it's pasted/imported content, it likely already has questions or is ready for the simple flow.
      // In our current implementation, "Imported" sources via AI Studio set isPasted=true.
      // We assume these are ready to be "sifted" (or already have a sift).
      if (source?.isPasted) {
          // Redirect to Sifts page to resume/start the session
          router.push("/sifts");
      } else {
          toast.info("AI Generation coming soon!", {
              description: "For uploaded files, use the 'AI Studio' to import generated questions for now."
          });
      }
  };

  return (
    <div className="mx-auto space-y-8 md:px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Library</h1>
        <p className="text-muted-foreground">
            Manage your knowledge sources and start sifting.
        </p>
      </div>

      <SourceUploader onUploadComplete={fetchSources} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => (
            <Card key={source.id} className="p-4 flex flex-col justify-between gap-4 group hover:border-primary/50 transition-colors">
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <HugeiconsIcon icon={File01Icon} className="h-6 w-6" />
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDelete(source.id)}
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
            <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl font-jakarta">
                No sources yet. Upload one to get started.
            </div>
        )}
      </div>
    </div>
  );
}
