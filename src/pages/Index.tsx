import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { AnalysisForm } from "@/components/AnalysisForm";
import { EpisodesTable } from "@/components/EpisodesTable";
import { EpisodeDetail } from "@/components/EpisodeDetail";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CompactProfileIndicator } from "@/components/CompactProfileIndicator";
import { PublicLanding } from "@/components/PublicLanding";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show public landing page for non-authenticated users
  if (!user) {
    return <PublicLanding />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
        <CompactProfileIndicator onSelectEpisode={setSelectedEpisodeId} />
        <ThemeToggle />
      </div>
      <HeroSection />
      <div className="container mx-auto px-4 py-12 space-y-12 max-w-6xl">
        <AnalysisForm />
        {selectedEpisodeId ? (
          <EpisodeDetail 
            episodeId={selectedEpisodeId} 
            onBack={() => setSelectedEpisodeId(null)} 
          />
        ) : (
          <EpisodesTable onSelectEpisode={setSelectedEpisodeId} />
        )}
      </div>
    </div>
  );
};

export default Index;
