import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [isOpen, setIsOpen] = useState(false);

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
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] max-h-[500px] overflow-y-auto"
        align="end"
        sideOffset={8}
      >
        {isOpen && (
          <ProfileSettings
            defaultTab="profiles"
            onSelectEpisode={(id) => {
              onSelectEpisode?.(id);
              setIsOpen(false);
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  );
};
