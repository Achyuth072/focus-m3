'use client';

import { addMonths, startOfYear } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface YearViewProps {
  currentYear: number;
  onDateClick?: (date: Date) => void;
  className?: string;
}

export function YearView({ currentYear, onDateClick, className }: YearViewProps) {
  const start = startOfYear(new Date(currentYear, 0, 1));

  return (
    <div className={cn('h-full overflow-y-auto', className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
      {Array.from({ length: 12 }).map((_, i) => {
        const monthDate = addMonths(start, i);
        
        return (
          <div key={i} className="border rounded-lg p-3 bg-card">
            <Calendar
              {...({
                mode: "single",
                month: monthDate,
                selected: undefined,
                onSelect: onDateClick,
                showOutsideDays: false,
              } as any)}
              className="w-full [&_td]:text-xs [&_th]:text-xs"
              classNames={{
                months: 'flex flex-col',
                month: 'space-y-2',
                nav: 'hidden', // Hide prev/next buttons in year view
                caption: 'flex justify-center pt-1 relative items-center text-sm font-medium',
                head_row: 'flex',
                head_cell: 'text-muted-foreground rounded-md w-8 font-normal text-[0.7rem]',
                row: 'flex w-full mt-1',
                cell: 'relative p-0 text-center text-xs focus-within:relative focus-within:z-20',
                day: cn(
                  'h-8 w-8 p-0 font-normal aria-selected:opacity-100',
                  'hover:bg-accent hover:text-accent-foreground'
                ),
                day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                day_today: 'bg-accent text-accent-foreground',
                day_outside: 'hidden',
                day_disabled: 'text-muted-foreground opacity-50',
              }}
            />
          </div>
        );
      })}
      </div>
    </div>
  );
}
