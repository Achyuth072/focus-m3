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
      className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg md:bottom-8 md:right-8"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
