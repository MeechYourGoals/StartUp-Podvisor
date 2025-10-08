import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface StartupProfile {
  company_name: string;
  company_website: string;
  stage: string;
  funding_raised: string;
  valuation: string;
  employee_count: number;
  industry: string;
  description: string;
}

interface SavedProfile {
  id: string;
  company_name: string;
  company_website: string | null;
  stage: string;
  funding_raised: string | null;
  valuation: string | null;
  employee_count: number | null;
  industry: string | null;
  description: string;
}

interface StartupProfileFormProps {
  onSubmit: (profile: StartupProfile, saveProfile: boolean) => void;
  savedProfiles?: SavedProfile[];
}

export const StartupProfileForm = ({ onSubmit, savedProfiles = [] }: StartupProfileFormProps) => {
  const { toast } = useToast();
  const [saveProfile, setSaveProfile] = useState(false);
  const [useExisting, setUseExisting] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  
  const [formData, setFormData] = useState<StartupProfile>({
    company_name: "",
    company_website: "",
    stage: "",
    funding_raised: "",
    valuation: "",
    employee_count: 0,
    industry: "",
    description: "",
  });

  const handleSelectProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    const profile = savedProfiles.find(p => p.id === profileId);
    if (profile) {
      setFormData({
        company_name: profile.company_name,
        company_website: profile.company_website || "",
        stage: profile.stage,
        funding_raised: profile.funding_raised || "",
        valuation: profile.valuation || "",
        employee_count: profile.employee_count || 0,
        industry: profile.industry || "",
        description: profile.description,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only validate if user wants to save profile OR is using an existing one
    if ((saveProfile || useExisting) && (!formData.company_name || !formData.stage || !formData.description)) {
      toast({
        title: "Missing Information",
        description: "Please fill in company name, stage, and description to save as a profile.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData, saveProfile && !useExisting);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Startup Context (Optional)</CardTitle>
        <CardDescription>
          Skip this step to get universal insights, or fill in your startup details to get personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {savedProfiles.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-existing"
                  checked={useExisting}
                  onCheckedChange={setUseExisting}
                />
                <Label htmlFor="use-existing" className="cursor-pointer">
                  Use Saved Profile
                </Label>
              </div>
            </div>
          )}

          {useExisting && savedProfiles.length > 0 && (
            <div className="space-y-2">
              <Label>Select Profile</Label>
              <Select value={selectedProfileId} onValueChange={handleSelectProfile}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a saved profile" />
                </SelectTrigger>
                <SelectContent>
                  {savedProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!useExisting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="save-profile"
                    checked={saveProfile}
                    onCheckedChange={setSaveProfile}
                  />
                  <Label htmlFor="save-profile" className="cursor-pointer">
                    Save as Profile (max 3)
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground px-4">
                Toggle on to save your startup details and get personalized insights. Leave off to skip personalization and get universal insights only.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name {(saveProfile || useExisting) && "*"}</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="e.g., Chravel"
              disabled={useExisting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_website">Website URL</Label>
            <Input
              id="company_website"
              type="url"
              value={formData.company_website}
              onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
              placeholder="https://yourcompany.com"
              disabled={useExisting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Current Stage {(saveProfile || useExisting) && "*"}</Label>
            <Select
              value={formData.stage}
              onValueChange={(value) => setFormData({ ...formData, stage: value })}
              disabled={useExisting}
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
              <Label htmlFor="funding_raised">Funding Raised</Label>
              <Input
                id="funding_raised"
                value={formData.funding_raised}
                onChange={(e) => setFormData({ ...formData, funding_raised: e.target.value })}
                placeholder="e.g., $2M"
                disabled={useExisting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valuation">Valuation</Label>
              <Input
                id="valuation"
                value={formData.valuation}
                onChange={(e) => setFormData({ ...formData, valuation: e.target.value })}
                placeholder="e.g., $10M"
                disabled={useExisting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_count">Team Size</Label>
              <Input
                id="employee_count"
                type="number"
                value={formData.employee_count}
                onChange={(e) => setFormData({ ...formData, employee_count: parseInt(e.target.value) || 0 })}
                placeholder="e.g., 8"
                disabled={useExisting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Travel Tech"
                disabled={useExisting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description {(saveProfile || useExisting) && "*"}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does your company do? What's your biggest challenge? What are you trying to achieve in the next 6-12 months?"
              className="min-h-[120px]"
              disabled={useExisting}
            />
          </div>

          <Button type="submit" className="w-full">
            Continue to Analysis
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
