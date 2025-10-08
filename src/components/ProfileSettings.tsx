import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Trash2, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
}

export const ProfileSettings = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<StartupProfile[]>([]);
  const [editingProfile, setEditingProfile] = useState<StartupProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  type StageType = "pre_seed" | "seed" | "series_a" | "series_b_plus" | "growth" | "public" | "bootstrapped";
  
  const [formData, setFormData] = useState<{
    company_name: string;
    company_website: string;
    stage: StageType | "";
    funding_raised: string;
    valuation: string;
    employee_count: number;
    industry: string;
    description: string;
  }>({
    company_name: "",
    company_website: "",
    stage: "" as StageType | "",
    funding_raised: "",
    valuation: "",
    employee_count: 0,
    industry: "",
    description: "",
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("user_startup_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.company_name || !formData.stage || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in company name, stage, and description.",
        variant: "destructive",
      });
      return;
    }

    if (!editingProfile && profiles.length >= 3) {
      toast({
        title: "Profile Limit Reached",
        description: "You can save up to 3 startup profiles. Delete one to add another.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (editingProfile) {
        const { error } = await supabase
          .from("user_startup_profiles")
          .update({
            company_name: formData.company_name,
            company_website: formData.company_website || null,
            stage: formData.stage as "pre_seed" | "seed" | "series_a" | "series_b_plus" | "growth" | "public" | "bootstrapped",
            funding_raised: formData.funding_raised || null,
            valuation: formData.valuation || null,
            employee_count: formData.employee_count || null,
            industry: formData.industry || null,
            description: formData.description,
          })
          .eq("id", editingProfile.id);

        if (error) throw error;
        toast({ title: "Profile updated successfully" });
      } else {
        const { error } = await supabase
          .from("user_startup_profiles")
          .insert([{
            company_name: formData.company_name,
            company_website: formData.company_website || null,
            stage: formData.stage as "pre_seed" | "seed" | "series_a" | "series_b_plus" | "growth" | "public" | "bootstrapped",
            funding_raised: formData.funding_raised || null,
            valuation: formData.valuation || null,
            employee_count: formData.employee_count || null,
            industry: formData.industry || null,
            description: formData.description,
            user_id: user?.id
          }]);

        if (error) throw error;
        toast({ title: "Profile created successfully" });
      }

      setIsCreating(false);
      setEditingProfile(null);
      setFormData({
        company_name: "",
        company_website: "",
        stage: "",
        funding_raised: "",
        valuation: "",
        employee_count: 0,
        industry: "",
        description: "",
      });
      fetchProfiles();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_startup_profiles")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Profile deleted successfully" });
      fetchProfiles();
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast({
        title: "Error",
        description: "Failed to delete profile",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (profile: StartupProfile) => {
    setEditingProfile(profile);
    setFormData({
      company_name: profile.company_name,
      company_website: profile.company_website || "",
      stage: profile.stage as StageType,
      funding_raised: profile.funding_raised || "",
      valuation: profile.valuation || "",
      employee_count: profile.employee_count || 0,
      industry: profile.industry || "",
      description: profile.description,
    });
    setIsCreating(true);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your bookmarks and startup profiles
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="profiles" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profiles">Startup Profiles</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="space-y-4">
            {!isCreating ? (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {profiles.length}/3 profiles saved
                  </p>
                  <Button
                    onClick={() => setIsCreating(true)}
                    disabled={profiles.length >= 3}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Profile
                  </Button>
                </div>

                <div className="space-y-3">
                  {profiles.map((profile) => (
                    <Card key={profile.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{profile.company_name}</CardTitle>
                            <p className="text-sm text-muted-foreground capitalize">
                              {profile.stage.replace(/_/g, " ")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(profile)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(profile.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm line-clamp-2">{profile.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
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
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What does your company do? What's your biggest challenge?"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    {editingProfile ? "Update" : "Save"} Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingProfile(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarks">
            <p className="text-sm text-muted-foreground">
              Bookmark management coming soon
            </p>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
