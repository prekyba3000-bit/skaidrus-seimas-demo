import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Layout } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Settings() {
  // Fetch user settings from backend
  const { data: settings, isLoading: isLoadingSettings } = trpc.user.getSettings.useQuery();
  const updateSettings = trpc.user.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Nustatymai išsaugoti");
    },
    onError: (error) => {
      toast.error(`Klaida: ${error.message}`);
    },
  });

  // Local state for UI (synced with backend)
  const [compactMode, setCompactMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [betaFeatures, setBetaFeatures] = useState(false);

  // Sync local state with backend settings
  useEffect(() => {
    if (settings) {
      setCompactMode(settings.compactMode ?? false);
      setEmailNotifications(settings.emailNotifications ?? false);
      setBetaFeatures(settings.betaFeatures ?? false);
      
      // Apply compact mode class
      if (settings.compactMode) {
        document.body.classList.add("compact-mode");
      } else {
        document.body.classList.remove("compact-mode");
      }
    }
  }, [settings]);

  // Handle compact mode change (saves to backend)
  const handleCompactModeChange = (checked: boolean) => {
    setCompactMode(checked);
    updateSettings.mutate({ compactMode: checked });
    // Apply class to body for global compact mode
    if (checked) {
      document.body.classList.add("compact-mode");
    } else {
      document.body.classList.remove("compact-mode");
    }
  };

  // Handle email notifications change
  const handleEmailNotificationsChange = (checked: boolean) => {
    setEmailNotifications(checked);
    updateSettings.mutate({ emailNotifications: checked });
  };

  // Handle beta features change
  const handleBetaFeaturesChange = (checked: boolean) => {
    setBetaFeatures(checked);
    updateSettings.mutate({ betaFeatures: checked });
  };

  return (
    <DashboardLayout title="Nustatymai">
      <div className="space-y-6 max-w-4xl">
        {/* Display Settings */}
        <Card className="bg-surface-dark border-surface-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Layout className="w-5 h-5 text-primary" />
              Rodymo nustatymai
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Label htmlFor="compact-mode" className="text-white">
                  Kompaktiškas režimas
                </Label>
                <p className="text-[#92adc9] text-sm">
                  Rodo tankesnius lenteles ir mažesnius tarpus
                </p>
              </div>
              <Switch
                id="compact-mode"
                checked={compactMode}
                onCheckedChange={handleCompactModeChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-surface-dark border-surface-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Pranešimų nustatymai
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Label htmlFor="email-notifications" className="text-white">
                  El. pašto pranešimai
                </Label>
                <p className="text-[#92adc9] text-sm">
                  Gaukite pranešimus apie sekamų narių veiklą el. paštu
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={handleEmailNotificationsChange}
                disabled={isLoadingSettings || updateSettings.isPending}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Label htmlFor="beta-features" className="text-white">
                  Beta funkcijos
                </Label>
                <p className="text-[#92adc9] text-sm">
                  Įjungti eksperimentines funkcijas ir ankstyvą prieigą prie naujų funkcijų
                </p>
              </div>
              <Switch
                id="beta-features"
                checked={betaFeatures}
                onCheckedChange={handleBetaFeaturesChange}
                disabled={isLoadingSettings || updateSettings.isPending}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
