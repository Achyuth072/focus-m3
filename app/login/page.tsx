'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

function LoginContent() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div {...slideUp}>
        <div className="max-w-md w-full p-8 rounded-xl border border-border bg-card">
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <span className="text-3xl font-semibold">F</span>
            </div>
            
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-semibold">FocusM3</h1>
              <p className="text-muted-foreground">
                Your personal productivity super-app
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">
                {error.includes('Signups not allowed') || error.includes('signup_disabled')
                  ? 'This app is private. Only authorized users can sign in.'
                  : 'Authentication failed. Please try again.'}
              </p>
            )}

            <Button
              size="lg"
              onClick={signInWithGoogle}
              className="w-full mt-4"
            >
              Sign in with Google
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
