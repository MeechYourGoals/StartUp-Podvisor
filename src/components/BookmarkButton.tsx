import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  episodeId: string;
  variant?: "default" | "ghost";
  size?: "default" | "sm" | "icon";
}

export const BookmarkButton = ({ episodeId, variant = "ghost", size = "icon" }: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkBookmark();
  }, [episodeId]);

  const checkBookmark = async () => {
    const { data } = await supabase
      .from('bookmarked_episodes')
      .select('id')
      .eq('episode_id', episodeId)
      .maybeSingle();
    
    setIsBookmarked(!!data);
  };

  const toggleBookmark = async () => {
    setLoading(true);
    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarked_episodes')
          .delete()
          .eq('episode_id', episodeId);
        
        setIsBookmarked(false);
        toast({ title: "Bookmark removed" });
      } else {
        await supabase
          .from('bookmarked_episodes')
          .insert({ episode_id: episodeId, user_id: null });
        
        setIsBookmarked(true);
        toast({ title: "Episode bookmarked" });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to update bookmark", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleBookmark}
      disabled={loading}
      className={cn(isBookmarked && "text-primary")}
    >
      <Heart className={cn("w-4 h-4", isBookmarked && "fill-current")} />
    </Button>
  );
};