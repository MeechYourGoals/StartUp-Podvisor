import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { AnalysisForm } from "@/components/AnalysisForm";
import { EpisodesTable } from "@/components/EpisodesTable";
import { EpisodeDetail } from "@/components/EpisodeDetail";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileSettings } from "@/components/ProfileSettings";
import { PublicLanding } from "@/components/PublicLanding";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Loader2, Bookmark, LogOut, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TIER_PRICING } from "@/types/subscription";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const { user, loading, signOut } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const tierInfo = subscription?.tier ? TIER_PRICING[subscription.tier] : TIER_PRICING.free;

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

  // Show public landing page for non-authenticated users
  if (!user) {
    return <PublicLanding />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="fixed top-4 right-4 z-50 flex gap-2 items-center">
        {subscription && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/account")}
            className="hidden sm:flex items-center gap-2"
          >
            <Badge variant={subscription.tier === "free" ? "secondary" : "default"} className="text-xs">
              {tierInfo.displayName}
            </Badge>
            <User className="h-4 w-4" />
          </Button>
        )}
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
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate("/account")}>
                    <Zap className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[65vh] pr-4">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>

        <Button
          variant={profileOpen && activeTab === "profiles" ? "default" : "outline"}
          size="sm"
          onClick={() => handleToggle("profiles")}
        >
          <Briefcase className="h-4 w-4 mr-2" />
          Startup Profiles
        </Button>

        <Button
          variant={profileOpen && activeTab === "bookmarks" ? "default" : "outline"}
          size="sm"
          onClick={() => handleToggle("bookmarks")}
        >
          <Bookmark className="h-4 w-4 mr-2" />
          Bookmarks
        </Button>

        <ThemeToggle />
      </div>

      {/* Desktop Profile Box - Positioned relative to align with content */}
      {isDesktop && profileOpen && (
        <div className="fixed inset-x-0 top-[80px] z-40 pointer-events-none">
          <div className="container mx-auto max-w-6xl px-4 relative">
            <div className="absolute right-4 top-0 pointer-events-auto">
              <Card className="w-[350px] max-h-[calc(100vh-100px)] overflow-hidden shadow-2xl p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <ScrollArea className="h-full max-h-[calc(100vh-140px)]">
                  <ProfileSettings
                    key={activeTab}
                    defaultTab={activeTab}
                    onSelectEpisode={setSelectedEpisodeId}
                    condensed={true}
                  />
                </ScrollArea>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sheet - Fallback */}
      {!isDesktop && (
        <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>My Bookmarks & Settings</SheetTitle>
              <SheetDescription>
                Manage your bookmarks and startup profiles
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-120px)] pr-4 mt-4">
              {profileOpen && (
                <ProfileSettings
                  defaultTab={activeTab}
                  onSelectEpisode={(id) => {
                    setSelectedEpisodeId(id);
                    setProfileOpen(false);
                  }}
                />
              )}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}

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
