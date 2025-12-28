'use client';

import { CheckCircle2, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompletedTasks } from '@/components/CompletedTasksProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GroupOption, SortOption, GROUP_LABELS, SORT_LABELS } from '@/lib/types/sorting';

interface TasksPageHeaderProps {
  currentSort: SortOption;
  currentGroup: GroupOption;
  onSortChange: (sort: SortOption) => void;
  onGroupChange: (group: GroupOption) => void;
}

export function TasksPageHeader({
  currentSort,
  currentGroup,
  onSortChange,
  onGroupChange,
}: TasksPageHeaderProps) {
  const { openSheet } = useCompletedTasks();

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ListFilter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={currentSort}
            onValueChange={(v) => onSortChange(v as SortOption)}
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <DropdownMenuRadioItem key={value} value={value}>
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Group By</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={currentGroup}
            onValueChange={(v) => onGroupChange(v as GroupOption)}
          >
            {Object.entries(GROUP_LABELS).map(([value, label]) => (
              <DropdownMenuRadioItem key={value} value={value}>
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        onClick={openSheet}
        className="hidden md:flex items-center gap-2"
      >
        <CheckCircle2 className="h-4 w-4" />
        Completed
      </Button>
    </div>
  );
}
