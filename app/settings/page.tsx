'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { LoaderOverlay } from '@/components/ui/loader-overlay';
import { Moon, Sun, Monitor, LogOut, User, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { SignOutConfirmation } from '@/components/auth/SignOutConfirmation';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'appearance' | 'account'>('appearance');
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Prevent flash during sign-out remount
  if (!user) {
    return <LoaderOverlay message="Signing out..." />;
  }

  const handleSignOut = async () => {
    setShowSignOutConfirm(false);
    setIsSigningOut(true);
    await signOut();
    router.push('/login');
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
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
            <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
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
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Settings</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Manage your account and preferences
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={cn(
                    "block w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                    activeTab === 'appearance'
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  Appearance
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={cn(
                    "block w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                    activeTab === 'account'
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
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
            {(!isDesktop || activeTab === 'appearance') && (
              <section className="space-y-4">
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
                               ? 'border-foreground bg-secondary/30'
                               : 'border-border/50 hover:border-border bg-background'
                           )}
                         >
                           <Icon className="h-5 w-5 text-muted-foreground" />
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
              </section>
            )}

            {/* Account Section */}
            {(!isDesktop || activeTab === 'account') && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Account
                  </h2>
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
                          {user?.email || 'Not signed in'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowSignOutConfirm(true)}
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
                Kanso • Version 1.0.0
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

