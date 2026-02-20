import { useState, useCallback } from "react";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/** Supported MIME types for calendar/agenda/lineup import */
export const SMART_IMPORT_ACCEPT = [
  "text/calendar",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const SMART_IMPORT_EXTENSIONS = ".ics,.csv,.xls,.xlsx,.pdf,.jpg,.jpeg,.png,.webp,.gif";

export type SmartImportContext = "calendar" | "agenda" | "lineup";

export interface SmartImportDropZoneProps {
  /** Context determines which events/items are imported */
  context?: SmartImportContext;
  /** Called when a valid file is dropped or selected */
  onFileSelect: (file: File) => void | Promise<void>;
  /** Whether the zone is in a processing state (disables new drops) */
  isProcessing?: boolean;
  /** Optional className for the container */
  className?: string;
  /** Custom instruction text */
  instructionText?: string;
}

/**
 * Reusable drag-and-drop zone for Smart Import (calendar, agenda, lineup).
 * Works reliably on desktop: requires e.preventDefault() on dragover for drop to fire.
 */
export const SmartImportDropZone = ({
  context = "calendar",
  onFileSelect,
  isProcessing = false,
  className,
  instructionText,
}: SmartImportDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(
    async (file: File) => {
      const validTypes = [
        ...SMART_IMPORT_ACCEPT,
        "text/plain", // Some CSV served as text/plain
      ];
      const isValid =
        validTypes.includes(file.type) ||
        file.name.match(/\.(ics|csv|xls|xlsx|pdf|jpg|jpeg|png|webp|gif)$/i);

      if (!isValid) {
        toast({
          title: "Invalid file type",
          description: "Please upload ICS, CSV, Excel, PDF, or image files.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 20MB.",
          variant: "destructive",
        });
        return;
      }

      try {
        await onFileSelect(file);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Import failed";
        toast({
          title: "Import failed",
          description: message,
          variant: "destructive",
        });
      }
    },
    [onFileSelect, toast]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if we're leaving the drop zone (not entering a child)
    const relatedTarget = e.relatedTarget as Node | null;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && !isProcessing) {
        void handleFile(file);
      }
    },
    [handleFile, isProcessing]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && !isProcessing) {
        void handleFile(file);
      }
      e.target.value = "";
    },
    [handleFile, isProcessing]
  );

  const defaultInstruction =
    instructionText ?? "Drag and drop a file here, or click to browse";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={defaultInstruction}
      className={cn(
        "relative flex min-h-[140px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors",
        isDragging && "border-primary bg-primary/5",
        isProcessing && "cursor-not-allowed border-muted bg-muted/20",
        !isDragging && !isProcessing && "border-muted-foreground/25 hover:border-primary/50",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isProcessing ? (
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Processing your file...</span>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center gap-2">
          <input
            type="file"
            className="hidden"
            accept={SMART_IMPORT_EXTENSIONS}
            onChange={handleFileInput}
            disabled={isProcessing}
          />
          <FileText className="h-10 w-10 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{defaultInstruction}</span>
          <div className="flex flex-wrap justify-center gap-1.5">
            {["ICS", "CSV", "Excel", "PDF", "Image"].map((badgeLabel) => (
              <span
                key={badgeLabel}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {badgeLabel}
              </span>
            ))}
          </div>
        </label>
      )}
    </div>
  );
};
