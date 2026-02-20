/**
 * SmartImportModal – Import calendar/agenda/lineup from file, URL, or pasted text.
 * Uses SmartImportDropZone for drag-and-drop (desktop) and click-to-browse.
 *
 * Usage:
 *   <SmartImportModal
 *     open={open}
 *     onOpenChange={setOpen}
 *     context="calendar"
 *     onFileImport={async (file) => { ... }}
 *     onUrlImport={async (url) => { ... }}
 *     onTextImport={async (text) => { ... }}
 *   />
 */
import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  SmartImportDropZone,
  type SmartImportContext,
} from "@/components/SmartImportDropZone";

export interface SmartImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Context: calendar, agenda, or lineup */
  context?: SmartImportContext;
  /** Called when file is selected (drag or browse) */
  onFileImport?: (file: File) => void | Promise<void>;
  /** Called when URL is submitted */
  onUrlImport?: (url: string) => void | Promise<void>;
  /** Called when text is pasted and submitted */
  onTextImport?: (text: string) => void | Promise<void>;
}

const CONTEXT_LABELS: Record<SmartImportContext, string> = {
  calendar: "Calendar Events",
  agenda: "Agenda Items",
  lineup: "Lineup",
};

export const SmartImportModal = ({
  open,
  onOpenChange,
  context = "calendar",
  onFileImport,
  onUrlImport,
  onTextImport,
}: SmartImportModalProps) => {
  const [url, setUrl] = useState("");
  const [pasteTextMode, setPasteTextMode] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const label = CONTEXT_LABELS[context];
  const title = `Import ${label}`;

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!onFileImport) return;
      setIsProcessing(true);
      try {
        await onFileImport(file);
        onOpenChange(false);
      } finally {
        setIsProcessing(false);
      }
    },
    [onFileImport, onOpenChange]
  );

  const handleUrlImport = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed || !onUrlImport) return;
    setIsProcessing(true);
    try {
      await onUrlImport(trimmed);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
    }
  }, [url, onUrlImport, onOpenChange]);

  const handleTextImport = useCallback(async () => {
    const trimmed = pastedText.trim();
    if (!trimmed || !onTextImport) return;
    setIsProcessing(true);
    try {
      await onTextImport(trimmed);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
    }
  }, [pastedText, onTextImport, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Import events from a file, URL, or paste schedule text.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File upload - drag-and-drop + Choose File */}
          {onFileImport && (
            <div className="space-y-3">
              <SmartImportDropZone
                context={context}
                onFileSelect={handleFileSelect}
                isProcessing={isProcessing}
                instructionText="Drag and drop a file here, or click to browse"
              />
              <div className="flex w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".ics,.csv,.xls,.xlsx,.pdf,.jpg,.jpeg,.png,.webp,.gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFileSelect(file);
                    e.target.value = "";
                  }}
                  disabled={isProcessing}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isProcessing}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
              </div>
            </div>
          )}

          {/* URL import */}
          {onUrlImport && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                or import from a URL
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste a schedule URL (team's site, ticketing page...)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button
                  onClick={handleUrlImport}
                  disabled={!url.trim() || isProcessing}
                >
                  Import
                </Button>
              </div>
            </div>
          )}

          {/* Paste text toggle */}
          {onTextImport && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="paste-text-mode"
                  checked={pasteTextMode}
                  onCheckedChange={setPasteTextMode}
                  disabled={isProcessing}
                />
                <Label htmlFor="paste-text-mode" className="text-sm">
                  Paste schedule text instead
                </Label>
              </div>
              {pasteTextMode && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Paste your schedule or event list here..."
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    disabled={isProcessing}
                    rows={4}
                    className="resize-none"
                  />
                  <Button
                    onClick={handleTextImport}
                    disabled={!pastedText.trim() || isProcessing}
                    className="w-full"
                  >
                    Import from text
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
