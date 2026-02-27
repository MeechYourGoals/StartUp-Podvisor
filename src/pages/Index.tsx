import { useState, useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { AnalysisForm } from "@/components/AnalysisForm";
import { EpisodesTable } from "@/components/EpisodesTable";
import { EpisodeDetail } from "@/components/EpisodeDetail";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileSettings } from "@/components/ProfileSettings";
import { PublicLanding } from "@/components/PublicLanding";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Loader2, Bookmark, LogOut, Briefcase, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { triggerHapticFeedback } from "@/lib/capacitor";

const Index = () => {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profiles" | "bookmarks" | "subscription">("profiles");

  const { user, loading, signOut } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Show public landing page for non-authenticated users
  if (!loading && !user) {
    return <PublicLanding />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleToggle = (tab: "profiles" | "bookmarks") => {
    triggerHapticFeedback('light');
    if (profileOpen && activeTab === tab) {
      setProfileOpen(false);
    } else {
      setActiveTab(tab);
      setProfileOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 safe-area-inset">
      {/* Mobile & Tablet nav - compact header for touch devices */}
      {!isDesktop ? (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border safe-top">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="font-bold text-sm text-primary">Founder Lessons</span>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => { triggerHapticFeedback('light'); handleToggle("profiles"); }}>
                    <Briefcase className="h-4 w-4 mr-2" />
                    Startup Profiles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { triggerHapticFeedback('light'); handleToggle("bookmarks"); }}>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmarks
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { triggerHapticFeedback('light'); setProfileOpen(false); navigate("/account"); }}>
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { triggerHapticFeedback('light'); signOut(); }}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop nav */
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={activeTab === "profiles" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  triggerHapticFeedback('light');
                  setActiveTab("profiles");
                }}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Startup Profiles
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] mr-4 p-0" align="end" sideOffset={8}>
              <div className="max-h-[calc(100vh-100px)] overflow-hidden p-4">
                <ScrollArea className="h-full max-h-[calc(100vh-140px)]">
                  <ProfileSettings
                    key="profiles"
                    defaultTab="profiles"
                    onSelectEpisode={setSelectedEpisodeId}
                    condensed={true}
                  />
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={activeTab === "bookmarks" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  triggerHapticFeedback('light');
                  setActiveTab("bookmarks");
                }}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmarks
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] mr-4 p-0" align="end" sideOffset={8}>
               <div className="max-h-[calc(100vh-100px)] overflow-hidden p-4">
                <ScrollArea className="h-full max-h-[calc(100vh-140px)]">
                  <ProfileSettings
                    key="bookmarks"
                    defaultTab="bookmarks"
                    onSelectEpisode={setSelectedEpisodeId}
                    condensed={true}
                  />
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>

          <ThemeToggle />
        </div>
      )}

      {/* Mobile/Tablet Sheet */}
      {!isDesktop && (
        <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
          <SheetContent side="right" className="w-full max-w-[100vw] sm:w-[400px] safe-top safe-bottom">
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

      <div className={!isDesktop ? "pt-12" : ""}>
        <HeroSection />
      </div>
      <div className="container mx-auto px-4 py-8 sm:py-12 space-y-8 sm:space-y-12 max-w-6xl pb-24 md:pb-8 safe-bottom">
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

      <MobileBottomNav />
    </div>
  );
};

export default Index;
