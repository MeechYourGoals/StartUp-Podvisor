import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp, MoreVertical, Eye, Bookmark, Download, Copy, Youtube, Headphones, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExportModal } from "@/components/ExportModal";
import { BookmarkButton } from "@/components/BookmarkButton";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Episode {
  id: string;
  title: string;
  release_date: string | null;
  url: string;
  founder_names: string | null;
  analysis_status: string;
  company_id: string | null;
  companies?: {
    name: string;
    founding_year: number | null;
    current_stage: string | null;
    valuation: string | null;
    industry: string | null;
  } | null;
}

interface EpisodesTableProps {
  onSelectEpisode: (id: string) => void;
}

export const EpisodesTable = ({ onSelectEpisode }: EpisodesTableProps) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedExportId, setSelectedExportId] = useState<string | undefined>();
  const { toast } = useToast();

  const fetchEpisodes = async () => {
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select(`
          id,
          title,
          release_date,
          url,
          founder_names,
          analysis_status,
          company_id,
          companies (
            name,
            founding_year,
            current_stage,
            valuation,
            industry
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEpisodes(data || []);
    } catch (error) {
      console.error('Error fetching episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (episodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Delete this episode analysis? This will also remove all associated lessons, callouts, and personalized insights.')) {
      return;
    }

    // Optimistically remove from UI
    const previousEpisodes = episodes;
    setEpisodes(prev => prev.filter(ep => ep.id !== episodeId));

    try {
      const { data, error } = await supabase
        .from('episodes')
        .delete()
        .eq('id', episodeId)
        .select();

      if (error) throw error;

      // Verify deletion occurred
      if (!data || data.length === 0) {
        throw new Error('Delete not permitted or episode not found');
      }

      toast({
        title: "Analysis deleted",
        description: "Episode and all associated data have been removed.",
      });
    } catch (error) {
      console.error('Error deleting episode:', error);
      // Revert optimistic update on failure
      setEpisodes(previousEpisodes);
      toast({
        title: "Delete failed",
        description: "Could not delete the episode. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEpisodes();

    // Listen for new episodes
    const handleEpisodeAnalyzed = () => {
      fetchEpisodes();
    };

    window.addEventListener('episodeAnalyzed', handleEpisodeAnalyzed);
    return () => {
      window.removeEventListener('episodeAnalyzed', handleEpisodeAnalyzed);
    };
  }, []);

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">Loading episodes...</div>
      </Card>
    );
  }

  const getPlatformIcon = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return <Youtube className="w-4 h-4" />;
    }
    return <Headphones className="w-4 h-4" />;
  };

  const getPlatformLabel = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return "Watch Now";
    }
    return "Listen Now";
  };

  const handleExport = (episodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedExportId(episodeId);
    setExportModalOpen(true);
  };

  const handleCopyLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
  };

  if (episodes.length === 0) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-xl font-semibold mb-2">No episodes analyzed yet</h3>
        <p className="text-muted-foreground">
          Start by analyzing your first podcast episode above
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
        <div className="p-6 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Analyzed Episodes
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {episodes.length} episode{episodes.length !== 1 ? 's' : ''} in database
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedExportId(undefined);
                setExportModalOpen(true);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Episode</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Founder(s)</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {episodes.map((episode) => (
              <TableRow 
                key={episode.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onSelectEpisode(episode.id)}
              >
                <TableCell className="font-medium max-w-md">
                  <div className="space-y-1">
                    <div className="line-clamp-2">{episode.title}</div>
                    {episode.release_date && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(episode.release_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {episode.companies?.name || '-'}
                </TableCell>
                <TableCell>{episode.founder_names || '-'}</TableCell>
                <TableCell>
                  {episode.companies?.current_stage ? (
                    <Badge variant="secondary">{episode.companies.current_stage}</Badge>
                  ) : '-'}
                </TableCell>
                <TableCell>{episode.companies?.industry || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <BookmarkButton episodeId={episode.id} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(episode.url, '_blank');
                          }}
                        >
                          {getPlatformIcon(episode.url)}
                          <span className="ml-2">{getPlatformLabel(episode.url)}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEpisode(episode.id);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="ml-2">View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => handleExport(episode.id, e)}>
                          <Download className="w-4 h-4" />
                          <span className="ml-2">Export Episode</span>
                        </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleCopyLink(episode.url, e)}>
                        <Copy className="w-4 h-4" />
                        <span className="ml-2">Copy Link</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => handleDelete(episode.id, e)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="ml-2">Delete Analysis</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      </Card>
      <ExportModal
        episodeId={selectedExportId}
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
      />
    </>
  );
};
