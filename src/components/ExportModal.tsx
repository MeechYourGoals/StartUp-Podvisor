import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileText, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExportModalProps {
  episodeId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExportModal = ({ episodeId, open, onOpenChange }: ExportModalProps) => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const fetchEpisodeData = async (id: string) => {
    const { data: episode } = await supabase
      .from('episodes')
      .select(`
        *,
        companies(*),
        lessons(*),
        chavel_callouts(*)
      `)
      .eq('id', id)
      .single();
    return episode;
  };

  const fetchAllData = async () => {
    const { data: episodes } = await supabase
      .from('episodes')
      .select(`
        *,
        companies(*),
        lessons(*),
        chavel_callouts(*)
      `)
      .order('created_at', { ascending: false });
    return episodes;
  };

  const exportJSON = async () => {
    setExporting(true);
    try {
      const data = episodeId ? await fetchEpisodeData(episodeId) : await fetchAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `founder-lessons-${episodeId ? 'episode' : 'all'}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: "Export complete", description: "JSON file downloaded" });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Export failed", description: "Please try again", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      const data = episodeId ? [await fetchEpisodeData(episodeId)] : await fetchAllData();
      
      const csvRows = [];
      csvRows.push(['Episode Title', 'Company', 'Founders', 'Release Date', 'Lesson', 'Category', 'Impact', 'Actionability', 'URL']);
      
      data?.forEach((episode: any) => {
        episode.lessons?.forEach((lesson: any) => {
          csvRows.push([
            `"${episode.title?.replace(/"/g, '""') || ''}"`,
            `"${episode.companies?.name?.replace(/"/g, '""') || ''}"`,
            `"${episode.founder_names?.replace(/"/g, '""') || ''}"`,
            episode.release_date || '',
            `"${lesson.lesson_text?.replace(/"/g, '""') || ''}"`,
            lesson.category || '',
            lesson.impact_score || '',
            lesson.actionability_score || '',
            episode.url || ''
          ]);
        });
      });

      const csv = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `founder-lessons-${episodeId ? 'episode' : 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: "Export complete", description: "CSV file downloaded" });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Export failed", description: "Please try again", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const exportMarkdown = async () => {
    setExporting(true);
    try {
      const data = episodeId ? [await fetchEpisodeData(episodeId)] : await fetchAllData();
      
      let markdown = '# Founder Lessons\n\n';
      
      data?.forEach((episode: any) => {
        markdown += `## ${episode.title}\n\n`;
        markdown += `**Company:** ${episode.companies?.name || 'N/A'}\n\n`;
        markdown += `**Founders:** ${episode.founder_names || 'N/A'}\n\n`;
        markdown += `**Release Date:** ${episode.release_date || 'N/A'}\n\n`;
        markdown += `**URL:** ${episode.url}\n\n`;
        
        if (episode.lessons?.length > 0) {
          markdown += `### Lessons\n\n`;
          episode.lessons.forEach((lesson: any, idx: number) => {
            markdown += `${idx + 1}. **${lesson.lesson_text}**\n`;
            markdown += `   - Category: ${lesson.category || 'N/A'}\n`;
            markdown += `   - Impact: ${lesson.impact_score}/10\n`;
            markdown += `   - Actionability: ${lesson.actionability_score}/10\n\n`;
          });
        }
        
        markdown += '---\n\n';
      });

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `founder-lessons-${episodeId ? 'episode' : 'all'}-${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: "Export complete", description: "Markdown file downloaded" });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Export failed", description: "Please try again", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export {episodeId ? 'Episode' : 'All Episodes'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-4">
          <Button
            onClick={exportCSV}
            disabled={exporting}
            variant="outline"
            className="w-full justify-start"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export as CSV
          </Button>
          <Button
            onClick={exportJSON}
            disabled={exporting}
            variant="outline"
            className="w-full justify-start"
          >
            <FileJson className="w-4 h-4 mr-2" />
            Export as JSON
          </Button>
          <Button
            onClick={exportMarkdown}
            disabled={exporting}
            variant="outline"
            className="w-full justify-start"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export as Markdown
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};