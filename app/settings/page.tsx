'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { LoaderOverlay } from '@/components/ui/loader-overlay';
import { Moon, Sun, Monitor, LogOut, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Prevent flash during sign-out remount
  if (!user) {
    return <LoaderOverlay message="Signing out..." />;
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push('/login');
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Appearance Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50 hover:border-border'
                    )}
                  >
                    <Icon className={cn(
                      'h-5 w-5',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    <span className={cn(
                      'text-sm font-medium',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Account
            </h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || 'Not signed in'}
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
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
        </div>

        {/* App Info */}
        <div className="pt-8 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            FocusM3 • Version 1.0.0
          </p>
        </div>
      </div>

      {/* Loading Overlay */}
      {isSigningOut && <LoaderOverlay message="Signing out..." />}
    </div>
  );
}
