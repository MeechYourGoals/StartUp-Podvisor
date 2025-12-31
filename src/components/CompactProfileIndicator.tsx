import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProfileSettings } from "./ProfileSettings";

interface StartupProfile {
  id: string;
  company_name: string;
  stage: string;
}

export const CompactProfileIndicator = ({
  onSelectEpisode
}: {
  onSelectEpisode?: (id: string) => void;
}) => {
  const [activeProfile, setActiveProfile] = useState<StartupProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchActiveProfile();
  }, []);

  const fetchActiveProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("user_startup_profiles")
        .select("id, company_name, stage")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setActiveProfile(data[0]);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSelectEpisode = (id: string) => {
    setDialogOpen(false);
    onSelectEpisode?.(id);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline max-w-[120px] truncate">
            {activeProfile?.company_name || "Profiles"}
          </span>
        </Button>
      </DialogTrigger>
      {dialogOpen && (
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Startup Profiles & Bookmarks</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <ProfileSettings
              defaultTab="profiles"
              onSelectEpisode={handleSelectEpisode}
            />
          </ScrollArea>
        </DialogContent>
      )}
    </Dialog>
  );
};
