'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TaskSheet from '@/components/tasks/TaskSheet';

function SharePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [sharedContent, setSharedContent] = useState('');

  useEffect(() => {
    const title = searchParams.get('title') || '';
    const text = searchParams.get('text') || '';
    const url = searchParams.get('url') || '';

    // Combine shared data into task content
    let content = '';
    if (title) {
      content = title;
    } else if (text) {
      content = text;
    }
    
    // Append URL if present
    if (url) {
      content = content ? `${content}\n${url}` : url;
    }

    if (content) {
      setSharedContent(content);
      setIsOpen(true);
    } else {
      // No content shared, redirect to home
      router.push('/');
    }
  }, [searchParams, router]);

  const handleClose = () => {
    setIsOpen(false);
    // Small delay to allow close animation
    setTimeout(() => router.push('/'), 150);
  };

  return (
    <div className="min-h-screen bg-background">
      <TaskSheet
        open={isOpen}
        onClose={handleClose}
        initialTask={null}
        initialDate={null}
        initialContent={sharedContent}
      />
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SharePageContent />
    </Suspense>
  );
}
