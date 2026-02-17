import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeckUploadZone } from "@/components/DeckUploadZone";

type StageType = "pre_seed" | "seed" | "series_a" | "series_b_plus" | "growth" | "public" | "bootstrapped";

interface StartupProfile {
  id: string;
  company_name: string;
  company_website: string | null;
  stage: string;
  funding_raised: string | null;
  valuation: string | null;
  employee_count: number | null;
  industry: string | null;
  description: string;
  role: string | null;
}

interface StartupProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: StartupProfile | null;
  onSave: (data: {
    company_name: string;
    company_website: string;
    stage: StageType;
    funding_raised: string;
    valuation: string;
    employee_count: number;
    industry: string;
    description: string;
    role: string;
  }) => Promise<void>;
}

export const StartupProfileDialog = ({
  open,
  onOpenChange,
  profile,
  onSave,
}: StartupProfileDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    company_website: "",
    stage: "" as StageType | "",
    funding_raised: "",
    valuation: "",
    employee_count: 0,
    industry: "",
    description: "",
    role: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name,
        company_website: profile.company_website || "",
        stage: profile.stage as StageType,
        funding_raised: profile.funding_raised || "",
        valuation: profile.valuation || "",
        employee_count: profile.employee_count || 0,
        industry: profile.industry || "",
        description: profile.description,
        role: profile.role || "",
      });
    } else {
      setFormData({
        company_name: "",
        company_website: "",
        stage: "",
        funding_raised: "",
        valuation: "",
        employee_count: 0,
        industry: "",
        description: "",
        role: "",
      });
    }
  }, [profile, open]);

  const handleSave = async () => {
    if (!formData.company_name || !formData.stage || !formData.description) {
      return;
    }
    
    setLoading(true);
    try {
      await onSave({
        ...formData,
        stage: formData.stage as StageType,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{profile ? "Edit Profile" : "Create New Profile"}</DialogTitle>
          <DialogDescription>
            {profile 
              ? "Update your startup profile details" 
              : "Add a new startup profile to personalize your insights"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            <DeckUploadZone
              onFieldsExtracted={(fields) => {
                setFormData((prev) => ({
                  ...prev,
                  ...(fields.company_name && { company_name: fields.company_name }),
                  ...(fields.description && { description: fields.description }),
                  ...(fields.stage && { stage: fields.stage as StageType }),
                  ...(fields.industry && { industry: fields.industry }),
                  ...(fields.funding_raised && { funding_raised: fields.funding_raised }),
                  ...(fields.employee_count && { employee_count: fields.employee_count }),
                  ...(fields.company_website && { company_website: fields.company_website }),
                  ...(fields.role && { role: fields.role }),
                }));
              }}
            />
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Chravel"
              />
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                type="url"
                value={formData.company_website}
                onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                placeholder="https://chravel.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Stage *</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => setFormData({ ...formData, stage: value as StageType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre_seed">Pre-seed</SelectItem>
                  <SelectItem value="seed">Seed</SelectItem>
                  <SelectItem value="series_a">Series A</SelectItem>
                  <SelectItem value="series_b_plus">Series B+</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="bootstrapped">Bootstrapped</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Funding Raised</Label>
                <Input
                  value={formData.funding_raised}
                  onChange={(e) => setFormData({ ...formData, funding_raised: e.target.value })}
                  placeholder="$2M"
                />
              </div>
              <div className="space-y-2">
                <Label>Valuation</Label>
                <Input
                  value={formData.valuation}
                  onChange={(e) => setFormData({ ...formData, valuation: e.target.value })}
                  placeholder="$10M"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Team Size</Label>
                <Input
                  type="number"
                  value={formData.employee_count}
                  onChange={(e) => setFormData({ ...formData, employee_count: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Travel Tech"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Your Role</Label>
              <Textarea
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g., CEO, Head of Growth, or describe your responsibilities..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does your company do? What's your biggest challenge?"
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleSave} 
                className="flex-1"
                disabled={loading || !formData.company_name || !formData.stage || !formData.description}
              >
                {loading ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
