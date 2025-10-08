import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const POPULAR_PODCASTS = [
  "Crucible Moments",
  "Founders",
  "Y Combinator",
  "a16z",
  "How I Built This",
  "Acquired",
  "20VC",
];

export const AnalysisForm = () => {
  const [episodeUrl, setEpisodeUrl] = useState("");
  const [podcastName, setPodcastName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!episodeUrl.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter an episode URL",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress("Analyzing episode...");

    try {
      setProgress("Fetching episode data...");
      const { data, error } = await supabase.functions.invoke('analyze-episode', {
        body: { 
          episodeUrl, 
          podcastName: podcastName.trim() || undefined 
        }
      });

      if (error) {
        console.error("Analysis error:", error);
        toast({
          title: "Analysis Failed",
          description: error.message || "Failed to analyze episode. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setProgress("Extracting insights...");

      toast({
        title: "Analysis complete!",
        description: "Episode has been analyzed and added to the database",
      });

      setEpisodeUrl("");
      setPodcastName("");
      
      // Trigger a refresh of the episodes table
      window.dispatchEvent(new CustomEvent('episodeAnalyzed'));
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setProgress("");
    }
  };

  return (
    <Card className="p-8 shadow-lg border-primary/10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Analyze New Episode
          </h2>
          <p className="text-muted-foreground">
            Paste a podcast episode URL and let AI extract the founder lessons
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="podcastName" className="text-sm font-medium">
              Podcast Series <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <Input
              id="podcastName"
              placeholder="e.g., Crucible Moments (auto-detected if left blank)"
              value={podcastName}
              onChange={(e) => setPodcastName(e.target.value)}
              disabled={isAnalyzing}
              list="popular-podcasts"
            />
            <datalist id="popular-podcasts">
              {POPULAR_PODCASTS.map((podcast) => (
                <option key={podcast} value={podcast} />
              ))}
            </datalist>
            <p className="text-xs text-muted-foreground">
              Leave blank to auto-detect from the episode
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="episodeUrl" className="text-sm font-medium">
              Episode URL
            </label>
            <Input
              id="episodeUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={episodeUrl}
              onChange={(e) => setEpisodeUrl(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isAnalyzing}
          className="w-full md:w-auto"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {progress || "Analyzing Episode..."}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Episode
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};
