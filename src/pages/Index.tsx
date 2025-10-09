import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { AnalysisForm } from "@/components/AnalysisForm";
import { EpisodesTable } from "@/components/EpisodesTable";
import { EpisodeDetail } from "@/components/EpisodeDetail";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="fixed top-4 right-4 z-50">
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
