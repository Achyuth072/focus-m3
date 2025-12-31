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
      className="fixed bottom-22 right-6 h-14 w-14 rounded-xl shadow-lg md:hidden"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
