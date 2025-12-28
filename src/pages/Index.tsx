import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { AnalysisForm } from "@/components/AnalysisForm";
import { EpisodesTable } from "@/components/EpisodesTable";
import { EpisodeDetail } from "@/components/EpisodeDetail";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileSettings } from "@/components/ProfileSettings";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Bookmark, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const Index = () => {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

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
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Bookmark className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh]">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle>My Bookmarks & Settings</DialogTitle>
                  <DialogDescription>
                    Manage your bookmarks and startup profiles
                  </DialogDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </DialogHeader>
            
            <ScrollArea className="max-h-[65vh] pr-4">
              <ProfileSettings defaultTab="bookmarks" onSelectEpisode={setSelectedEpisodeId} />
            </ScrollArea>
          </DialogContent>
        </Dialog>
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
