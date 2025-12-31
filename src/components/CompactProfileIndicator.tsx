import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [profileCount, setProfileCount] = useState(0);

  useEffect(() => {
    fetchActiveProfile();
  }, []);

  const fetchActiveProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("user_startup_profiles")
        .select("id, company_name, stage")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setActiveProfile(data[0]);
        setProfileCount(data.length);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Building2 className="h-4 w-4" />
          {activeProfile ? (
            <span className="hidden sm:inline max-w-[120px] truncate">
              {activeProfile.company_name}
            </span>
          ) : (
            <span className="hidden sm:inline">Add Profile</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Startup Profiles & Bookmarks</DialogTitle>
          <DialogDescription>
            Manage your startup profiles and saved episodes
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
          <ProfileSettings
            defaultTab="profiles"
            onSelectEpisode={onSelectEpisode}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
