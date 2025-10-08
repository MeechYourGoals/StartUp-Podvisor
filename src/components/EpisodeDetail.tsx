import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, TrendingUp, Target, Lightbulb } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Lesson {
  id: string;
  lesson_text: string;
  impact_score: number;
  actionability_score: number;
  category: string | null;
  founder_attribution: string | null;
}

interface Callout {
  id: string;
  callout_text: string;
  relevance_score: number;
}

interface Episode {
  id: string;
  title: string;
  release_date: string | null;
  url: string;
  founder_names: string | null;
  companies?: {
    name: string;
    founding_year: number | null;
    current_stage: string | null;
    funding_raised: string | null;
    valuation: string | null;
    employee_count: number | null;
    industry: string | null;
    status: string | null;
  } | null;
}

interface EpisodeDetailProps {
  episodeId: string;
  onBack: () => void;
}

export const EpisodeDetail = ({ episodeId, onBack }: EpisodeDetailProps) => {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [callouts, setCallouts] = useState<Callout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEpisodeDetails = async () => {
      try {
        // Fetch episode with company data
        const { data: episodeData, error: episodeError } = await supabase
          .from('episodes')
          .select(`
            id,
            title,
            release_date,
            url,
            founder_names,
            companies (
              name,
              founding_year,
              current_stage,
              funding_raised,
              valuation,
              employee_count,
              industry,
              status
            )
          `)
          .eq('id', episodeId)
          .single();

        if (episodeError) throw episodeError;
        setEpisode(episodeData);

        // Fetch lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('episode_id', episodeId)
          .order('impact_score', { ascending: false });

        if (lessonsError) throw lessonsError;
        setLessons(lessonsData || []);

        // Fetch callouts
        const { data: calloutsData, error: calloutsError } = await supabase
          .from('chavel_callouts')
          .select('*')
          .eq('episode_id', episodeId)
          .order('relevance_score', { ascending: false });

        if (calloutsError) throw calloutsError;
        setCallouts(calloutsData || []);
      } catch (error) {
        console.error('Error fetching episode details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodeDetails();
  }, [episodeId]);

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">Loading episode details...</div>
      </Card>
    );
  }

  if (!episode) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">Episode not found</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to All Episodes
      </Button>

      <Card className="p-8">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{episode.title}</h1>
              {episode.founder_names && (
                <p className="text-lg text-muted-foreground mb-2">
                  with {episode.founder_names}
                </p>
              )}
              {episode.release_date && (
                <p className="text-sm text-muted-foreground">
                  Released: {new Date(episode.release_date).toLocaleDateString()}
                </p>
              )}
            </div>
            <Button asChild size="lg">
              <a href={episode.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                {episode.url.includes('youtube.com') || episode.url.includes('youtu.be') 
                  ? 'Watch Episode' 
                  : 'Listen Now'}
              </a>
            </Button>
          </div>

          {episode.companies && (
            <>
              <Separator />
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Company Snapshot</h3>
                  <div className="space-y-2">
                    <InfoRow label="Company" value={episode.companies.name} />
                    <InfoRow label="Founded" value={episode.companies.founding_year?.toString()} />
                    <InfoRow label="Stage" value={episode.companies.current_stage} />
                    <InfoRow label="Industry" value={episode.companies.industry} />
                    <InfoRow label="Status" value={episode.companies.status} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Metrics</h3>
                  <div className="space-y-2">
                    <InfoRow label="Funding Raised" value={episode.companies.funding_raised} />
                    <InfoRow label="Valuation" value={episode.companies.valuation} />
                    <InfoRow label="Employees" value={episode.companies.employee_count?.toString()} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {lessons.length > 0 && (
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Top Lessons ({lessons.length})
          </h2>
          <div className="space-y-6">
            {lessons.map((lesson, index) => (
              <div key={lesson.id} className="border-l-4 border-primary pl-6 py-2">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    {lesson.category && <Badge variant="outline">{lesson.category}</Badge>}
                  </div>
                  <div className="flex gap-2 text-sm">
                    <Badge>Impact: {lesson.impact_score}/10</Badge>
                    <Badge>Actionability: {lesson.actionability_score}/10</Badge>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed mb-2">{lesson.lesson_text}</p>
                {lesson.founder_attribution && (
                  <p className="text-sm text-muted-foreground italic">
                    — {lesson.founder_attribution}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {callouts.length > 0 && (
        <Card className="p-8 bg-accent/5">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-accent" />
            Relevant for Chavel ({callouts.length})
          </h2>
          <div className="space-y-4">
            {callouts.map((callout) => (
              <div key={callout.id} className="flex items-start gap-4 p-4 bg-card rounded-lg border">
                <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-foreground leading-relaxed">{callout.callout_text}</p>
                  <div className="mt-2">
                    <Badge variant="outline">Relevance: {callout.relevance_score}/10</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
};
