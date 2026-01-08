'use client';

import { useState } from 'react';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateProject } from '@/lib/hooks/useProjectMutations';
import { useHaptic } from '@/lib/hooks/useHaptic';
import { cn } from '@/lib/utils';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Curated color palette for projects
const PROJECT_COLORS = [
  { name: 'Berry', value: '#E91E63' },
  { name: 'Red', value: '#F44336' },
  { name: 'Orange', value: '#FF9800' },
  { name: 'Yellow', value: '#FFEB3B' },
  { name: 'Green', value: '#4CAF50' },
  { name: 'Teal', value: '#009688' },
  { name: 'Blue', value: '#2196F3' },
  { name: 'Indigo', value: '#3F51B5' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Grey', value: '#607D8B' },
];

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[6].value); // Default to Blue
  const createProject = useCreateProject();
  const { trigger } = useHaptic();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    trigger(50);
    await createProject.mutateAsync({ name: name.trim(), color });
    setName('');
    setColor(PROJECT_COLORS[6].value);
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-auto max-h-[90dvh]">
          <ResponsiveDialogHeader className="px-4 pt-6 shrink-0">
            <ResponsiveDialogTitle>Create Project</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Organize your tasks into a new project.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Work, Personal, School..."
                autoFocus
                className="h-12 sm:h-10 text-base"
              />
            </div>

            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-3 sm:gap-2">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.name}
                    onClick={() => {
                      trigger(25);
                      setColor(c.value);
                    }}
                    className={cn(
                      'h-10 w-10 sm:h-8 sm:w-8 rounded-xl transition-all border-2',
                      color === c.value
                        ? 'border-current opacity-100'
                        : 'border-transparent opacity-70 hover:opacity-90'
                    )}
                    style={{ 
                      backgroundColor: c.value,
                      borderColor: color === c.value ? c.value : 'transparent'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex justify-end gap-3 p-4 border-t pb-[calc(1rem+env(safe-area-inset-bottom))] bg-background">
            <Button type="button" variant="ghost" onClick={() => {
              trigger(10);
              onOpenChange(false);
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || createProject.isPending}>
              {createProject.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
