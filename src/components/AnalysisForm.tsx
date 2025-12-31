import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StartupProfileForm } from "./StartupProfileForm";

const POPULAR_PODCASTS = [
  "Crucible Moments",
  "Founders",
  "Y Combinator",
  "a16z",
  "How I Built This",
  "Acquired",
  "20VC",
];

interface SavedProfile {
  id: string;
  company_name: string;
  company_website: string | null;
  stage: string;
  funding_raised: string | null;
  valuation: string | null;
  employee_count: number | null;
  industry: string | null;
  description: string;
}

export const AnalysisForm = () => {
  const [episodeUrl, setEpisodeUrl] = useState("");
  const [podcastName, setPodcastName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState("");
  const [inputMode, setInputMode] = useState<"series" | "url">("url");
  const [step, setStep] = useState<"episode" | "profile">("episode");
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [startupContext, setStartupContext] = useState<any>(null);
  const { toast } = useToast();
  const { isAdmin } = useUserRole();
  const profileLimit = isAdmin ? 10 : 3;

  useEffect(() => {
    fetchSavedProfiles();
  }, [isAdmin]);

  const fetchSavedProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("user_startup_profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(profileLimit);

      if (error) throw error;
      setSavedProfiles(data || []);
    } catch (error) {
      console.error("Error fetching saved profiles:", error);
    }
  };

  const handleEpisodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!episodeUrl.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter an episode URL",
        variant: "destructive",
      });
      return;
    }

    setStep("profile");
  };

  const handleProfileSubmit = async (profile: any, saveProfile: boolean) => {
    setStartupContext(profile);

    if (saveProfile) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("user_startup_profiles").insert([{
          ...profile,
          user_id: user?.id
        }]);
        fetchSavedProfiles();
      } catch (error) {
        console.error("Error saving profile:", error);
      }
    }

    // Check if profile has meaningful data - if all key fields are empty, pass null
    const hasData = profile.company_name || profile.stage || profile.description;
    await analyzeWithContext(hasData ? profile : null);
  };

  const analyzeWithContext = async (profile: any) => {
    setIsAnalyzing(true);
    setProgress("Analyzing episode with your startup context...");

    try {
      setProgress("Fetching episode data...");
      const { data, error } = await supabase.functions.invoke('analyze-episode', {
        body: { 
          episodeUrl, 
          podcastName: podcastName.trim() || undefined,
          startupProfile: profile
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

      setProgress("Generating personalized insights...");

      toast({
        title: "Analysis complete!",
        description: "Episode analyzed with personalized insights for your startup",
      });

      setEpisodeUrl("");
      setPodcastName("");
      setStep("episode");
      setStartupContext(null);
      
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

  if (step === "profile") {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setStep("episode")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Episode URL
        </Button>
        <StartupProfileForm
          onSubmit={handleProfileSubmit}
          savedProfiles={savedProfiles}
          isAnalyzing={isAnalyzing}
        />
      </div>
    );
  }

  return (
    <Card className="p-8 shadow-lg border-primary/10 hover:shadow-xl transition-shadow">
      <form onSubmit={handleEpisodeSubmit} className="space-y-6">
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
