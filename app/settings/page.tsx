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

const SignOutConfirmation = dynamic(
  () =>
    import("@/components/auth/SignOutConfirmation").then(
      (mod) => mod.SignOutConfirmation
    ),
  { ssr: false }
);

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { hapticsEnabled, setHapticsEnabled } = useUiStore();
  const { user, signOut, isGuestMode } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"appearance" | "account">(
    "appearance"
  );
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
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["stats-dashboard"] });
    toast.success("Demo data reset successfully");
  };

  const handleClearData = () => {
    mockStore.clearData();
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["stats-dashboard"] });
    toast.success("All data cleared");
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Mobile Header */}
        <div className="md:hidden mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
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

        {/* Desktop Grid Layout */}
        <div className="grid md:grid-cols-[240px_1fr] gap-12">
          {/* Sidebar Navigation (Desktop Only) */}
          <aside className="hidden md:block">
            <div className="sticky top-6 space-y-1">
              <h1 className="type-h1 mb-2">Settings</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Manage your account and preferences
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("appearance")}
                  className={cn(
                    "block w-full text-left px-3 py-2 text-sm rounded-md transition-seijaku-fast",
                    activeTab === "appearance"
                      ? "bg-secondary text-foreground font-medium"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  Appearance
                </button>
                <button
                  onClick={() => setActiveTab("account")}
                  className={cn(
                    "block w-full text-left px-3 py-2 text-sm rounded-md transition-seijaku-fast",
                    activeTab === "account"
                      ? "bg-secondary text-foreground font-medium"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  Account
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="md:pt-[88px] space-y-12">
            {/* Appearance Section */}
            {(!isDesktop || activeTab === "appearance") && (
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
                            trigger(25);
                            setTheme(option.value);
                          }}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-seijaku-fast",
                            isActive
                              ? "border-foreground bg-secondary/30"
                              : "border-border/50 hover:border-border bg-background"
                          )}
                        >
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isActive
                                ? "text-foreground"
                                : "text-muted-foreground"
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

            {/* Preference Section (Mobile Only) */}
            {!isDesktop && (
              <section className="space-y-4">
                <div>
                  <h2 className="type-micro font-medium uppercase">
                    Preferences
                  </h2>
                </div>

                <div className="space-y-3">
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
                </div>
              </section>
            )}

            {/* Guest Mode Section */}
            {isGuestMode && (!isDesktop || activeTab === "account") && (
              <section className="space-y-4">
                <div>
                  <h2 className="type-micro font-medium uppercase">
                    Guest Mode
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                    <p className="text-xs text-muted-foreground mb-3">
                      Your data is stored locally in your browser. Use these
                      controls to manage your demo data.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          trigger(30);
                          handleResetDemo();
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset Demo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={() => {
                          trigger(50);
                          handleClearData();
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Data
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Account Section */}
            {(!isDesktop || activeTab === "account") && (
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
                      trigger(50);
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

            {/* App Info */}
            <div className="pt-8 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                Kanso • Version 1.5.0
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

      {/* Loading Overlay */}
      {isSigningOut && <LoaderOverlay message="Signing out..." />}
    </div>
  );
}
