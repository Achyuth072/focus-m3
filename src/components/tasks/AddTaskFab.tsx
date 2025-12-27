'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddTaskFabProps {
  onClick: () => void;
}

export default function AddTaskFab({ onClick }: AddTaskFabProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed right-6 h-14 w-14 rounded-full shadow-lg max-md:top-[calc(100svh-9rem)] md:bottom-8 md:right-8"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
