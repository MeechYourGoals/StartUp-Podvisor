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
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!episodeUrl || !podcastName) {
      toast({
        title: "Missing information",
        description: "Please provide both episode URL and podcast name",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-episode', {
        body: { episodeUrl, podcastName }
      });

      if (error) throw error;

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
              Podcast Series
            </label>
            <Input
              id="podcastName"
              placeholder="e.g., Crucible Moments"
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
              Analyzing Episode...
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
