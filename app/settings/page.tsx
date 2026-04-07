"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { LoaderOverlay } from "@/components/ui/loader-overlay";
import {
  Moon,
  Sun,
  Monitor,
  LogOut,
  User,
  Loader2,
  ArrowLeft,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useUiStore } from "@/lib/store/uiStore";
import { Switch } from "@/components/ui/switch";
import { Vibrate } from "lucide-react";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { useQueryClient } from "@tanstack/react-query";
import { mockStore } from "@/lib/mock/mock-store";
import { toast } from "sonner";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { DeleteUserDataDialog } from "@/components/settings/DeleteUserDataDialog";
import { BackupSyncSettings } from "@/components/settings/BackupSyncSettings";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SignOutConfirmation = dynamic(
  () =>
    import("@/components/auth/SignOutConfirmation").then(
      (mod) => mod.SignOutConfirmation,
    ),
  { ssr: false },
);

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { hapticsEnabled, setHapticsEnabled } = useUiStore();
  const { user, signOut, isGuestMode } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "appearance" | "preferences" | "account"
  >("appearance");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { trigger } = useHaptic();

  // Prevent flash during sign-out remount
  if (!user) {
    return <LoaderOverlay message="Signing out..." />;
  }

  const handleSignOut = async () => {
    setShowSignOutConfirm(false);
    setIsSigningOut(true);
    await signOut();
    router.push("/login");
  };

  const handleResetDemo = () => {
    mockStore.reset();
    queryClient.removeQueries({ queryKey: ["tasks"] });
    queryClient.removeQueries({ queryKey: ["projects"] });
    queryClient.removeQueries({ queryKey: ["habits"] });
    queryClient.removeQueries({ queryKey: ["stats-dashboard"] });
    queryClient.removeQueries({ queryKey: ["calendar-events"] });
    queryClient.removeQueries({ queryKey: ["calendar-tasks"] });
    toast.success("Demo data reset successfully");
  };

  const handleClearData = () => {
    mockStore.clearData();
    queryClient.removeQueries({ queryKey: ["tasks"] });
    queryClient.removeQueries({ queryKey: ["projects"] });
    queryClient.removeQueries({ queryKey: ["habits"] });
    queryClient.removeQueries({ queryKey: ["stats-dashboard"] });
    queryClient.removeQueries({ queryKey: ["calendar-events"] });
    queryClient.removeQueries({ queryKey: ["calendar-tasks"] });
    toast.success("All data cleared");
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const sectionTabs = [
    { value: "appearance", label: "Appearance" },
    { value: "preferences", label: "Preferences" },
    { value: "account", label: "Account" },
  ] as const;

  return (
    <>
      <div className="flex flex-col min-h-[calc(100svh-4rem)] p-4 md:p-6 gap-6 md:gap-8 relative overflow-hidden scrollbar-hide">
        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onPointerDown={() => trigger("MEDIUM")}
              onClick={() => router.back()}
              className="h-12 w-12"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="type-h1">Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Mobile Section Switcher */}
        <div className="md:hidden sticky top-0 z-20 -mx-4 border-b border-border/50 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              trigger("MEDIUM");
              setActiveTab(v as "appearance" | "preferences" | "account");
            }}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 bg-secondary/10 p-1 rounded-lg h-11 border border-border/40 shadow-none">
              {sectionTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "rounded-md gap-2 text-[13px] font-medium tracking-tight data-[state=active]:bg-brand data-[state=active]:text-brand-foreground data-[state=active]:shadow-none transition-seijaku-fast h-9 border border-transparent data-[state=active]:border-brand/20 text-muted-foreground hover:text-foreground hover:bg-secondary/40",
                  )}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Desktop Grid Layout */}
        <div className="grid md:grid-cols-[240px_1fr] gap-12 flex-1">
          {/* Sidebar Navigation (Desktop Only) */}
          <aside className="hidden md:block">
            <div className="sticky top-6 space-y-1">
              <h1 className="type-h1 mb-2">Settings</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Manage your account and preferences
              </p>
              <nav className="space-y-1">
                {sectionTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      "block w-full rounded-md px-3 py-2 text-left text-sm transition-seijaku-fast",
                      activeTab === tab.value
                        ? "bg-secondary font-medium text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-8 md:space-y-12 flex flex-col md:pt-[96px]">
            {/* Appearance Section */}
            {activeTab === "appearance" && (
              <section className="space-y-4">
                <div>
                  <h2 className="type-micro font-medium uppercase">
                    Appearance
                  </h2>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      const isActive = theme === option.value;

                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            trigger("MEDIUM");
                            setTheme(option.value);
                          }}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-seijaku-fast",
                            isActive
                              ? "border-foreground bg-secondary/30"
                              : "border-border/50 hover:border-border bg-background",
                          )}
                        >
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isActive
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Preference Section (Mobile & Desktop) */}
            {activeTab === "preferences" && (
              <section className="space-y-4">
                <div>
                  <h2 className="type-micro font-medium uppercase">
                    Preferences
                  </h2>
                </div>

                <div className="space-y-3">
                  {!isDesktop && (
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-secondary/30">
                          <Vibrate className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Haptic Feedback</p>
                          <p className="text-xs text-muted-foreground">
                            Vibrate on interactions
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={hapticsEnabled}
                        onCheckedChange={setHapticsEnabled}
                      />
                    </div>
                  )}

                  <NotificationSettings />
                </div>
              </section>
            )}

            {/* Guest Mode Section */}
            {isGuestMode && activeTab === "account" && (
              <section className="space-y-4">
                <div>
                  <h2 className="type-micro font-medium uppercase">
                    Guest Mode
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-lg border border-brand/20 bg-brand/5">
                    <p className="text-xs text-muted-foreground mb-4">
                      Your data is stored locally in your browser. Sign in to
                      sync your data across devices and ensure it&apos;s never
                      lost.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button
                        className="w-full bg-brand hover:bg-brand/90 text-brand-foreground transition-all font-semibold"
                        onClick={() => {
                          trigger("MEDIUM");
                          router.push("/login");
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Sync to Account
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            trigger("HEAVY");
                            handleResetDemo();
                          }}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset Demo
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all active:scale-95 font-semibold"
                          onClick={() => {
                            trigger("HEAVY");
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2.25} />
                          Clear Data
                        </Button>
                      </div>
                    </div>
                  </div>

                  <BackupSyncSettings />
                </div>
              </section>
            )}

            {/* Account Section */}
            {activeTab === "account" && (
              <section className="space-y-4">
                <div>
                  <h2 className="type-micro font-medium uppercase">Account</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-secondary/30">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email || "Not signed in"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      trigger("HEAVY");
                      setShowSignOutConfirm(true);
                    }}
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing out...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </>
                    )}
                  </Button>
                </div>
              </section>
            )}

            {/* Version Branding - Unified at the bottom of the content flow */}
            <div className="pt-16 pb-12 transition-all duration-300">
              <div className="border-t border-border/40 w-16 mx-auto mb-8 opacity-50" />
              <p className="type-micro text-muted-foreground/80 text-center selection:bg-brand/10">
                Kanso • Version 1.16.2
              </p>
            </div>
          </main>
        </div>
      </div>

      <SignOutConfirmation
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
      />

      <DeleteUserDataDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleClearData}
      />

      {/* Loading Overlay */}
      {isSigningOut && <LoaderOverlay message="Signing out..." />}
    </>
  );
}
