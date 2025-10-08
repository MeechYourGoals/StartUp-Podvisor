import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp } from "lucide-react";
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
    <Card className="overflow-hidden">
      <div className="p-6 border-b bg-muted/30">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Analyzed Episodes
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {episodes.length} episode{episodes.length !== 1 ? 's' : ''} in database
        </p>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(episode.url, '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
