import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UsageDisplay, PricingPlans } from "@/components/subscription";
import { ArrowLeft, LogOut, Mail, Calendar, Loader2, RotateCcw } from "lucide-react";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Account = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { subscription, loading: subLoading, isNative, restorePurchases, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      toast({
        title: "Purchases restored",
        description: "Your subscription status has been updated.",
      });
    } catch (error) {
      toast({
        title: "Restore failed",
        description: "Could not restore purchases. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 safe-area-inset">
      {/* Mobile/Tablet header */}
      {isMobile ? (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="-ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <span className="font-semibold text-sm">Account</span>
            <ThemeToggle />
          </div>
        </div>
      ) : (
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      )}

      <div className="container mx-auto px-4 pt-14 pb-24 md:pt-8 md:pb-8 max-w-4xl safe-bottom">
        {!isMobile && (
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        )}

        <div className="space-y-8">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member since</p>
                  <p className="font-medium">
                    {user.created_at
                      ? format(new Date(user.created_at), "MMMM d, yyyy")
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscription & Usage */}
          <UsageDisplay showUpgrade />

          {/* Subscription Plans */}
          {subscription?.tier !== "series_z" && (
            <Card>
              <CardHeader>
                <CardTitle>Upgrade Your Plan</CardTitle>
                <CardDescription>
                  Unlock more profiles, bookmarks, and video analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PricingPlans />

                {isNative && (
                  <div className="mt-6 text-center">
                    <Button variant="outline" onClick={handleRestore}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore Purchases
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Already subscribed on another device? Restore your purchase.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Current Period Info */}
          {subscription?.currentPeriodEnd && subscription.tier !== "free" && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    {subscription.cancelAtPeriodEnd
                      ? "Your subscription ends on"
                      : "Your subscription renews on"}
                  </p>
                  <p className="text-lg font-semibold">
                    {format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}
                  </p>
                  {subscription.cancelAtPeriodEnd && (
                    <p className="text-sm text-amber-500 mt-2">
                      Your subscription will not renew. You'll continue to have access until the end date.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Account;
