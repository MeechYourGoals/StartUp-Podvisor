import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const [inputMode, setInputMode] = useState<"series" | "url">("url");
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
    <Card className="p-8 shadow-lg border-primary/10 hover:shadow-xl transition-shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Analyze New Episode
          </h2>
          <p className="text-muted-foreground">
            Paste a podcast episode URL and let AI extract the founder lessons
          </p>
        </div>

        <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "series" | "url")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="series">By Podcast Series</TabsTrigger>
            <TabsTrigger value="url">Direct URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="series" className="space-y-4 mt-6">
            <div className="space-y-2 max-w-xl mx-auto">
              <label htmlFor="podcastNameSeries" className="text-sm font-medium">
                Podcast Series Name
              </label>
              <Input
                id="podcastNameSeries"
                placeholder="e.g., Crucible Moments, How I Built This"
                value={podcastName}
                onChange={(e) => setPodcastName(e.target.value)}
                disabled={isAnalyzing}
                list="popular-podcasts"
                className="text-center"
              />
              <datalist id="popular-podcasts">
                {POPULAR_PODCASTS.map((podcast) => (
                  <option key={podcast} value={podcast} />
                ))}
              </datalist>
            </div>
            
            <div className="space-y-2 max-w-xl mx-auto">
              <label htmlFor="episodeUrlSeries" className="text-sm font-medium">
                Episode URL
              </label>
              <Input
                id="episodeUrlSeries"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={episodeUrl}
                onChange={(e) => setEpisodeUrl(e.target.value)}
                disabled={isAnalyzing}
                className="text-center"
              />
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4 mt-6">
            <div className="space-y-2 max-w-xl mx-auto">
              <label htmlFor="episodeUrlDirect" className="text-sm font-medium text-center block">
                Episode URL
              </label>
              <Input
                id="episodeUrlDirect"
                type="url"
                placeholder="https://youtube.com/watch?v=... or Spotify link"
                value={episodeUrl}
                onChange={(e) => setEpisodeUrl(e.target.value)}
                disabled={isAnalyzing}
                className="text-center text-lg py-6"
              />
              <p className="text-xs text-muted-foreground text-center">
                Podcast series will be auto-detected
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center">
          <Button 
            type="submit" 
            disabled={isAnalyzing}
            size="lg"
            className="min-w-[200px]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {progress || "Analyzing..."}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Episode
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
