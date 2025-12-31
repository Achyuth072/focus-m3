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
    <div className={cn('h-full overflow-y-auto bg-background', className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-8 p-8 max-w-7xl mx-auto">
      {Array.from({ length: 12 }).map((_, i) => {
        const monthDate = addMonths(start, i);
        
        return (
          <div key={i} className="flex justify-center">
            <Calendar
              {...({
                mode: "single",
                month: monthDate,
                selected: undefined,
                onSelect: onDateClick,
                showOutsideDays: false,
              } as any)}
              className="p-0 select-none [--cell-size:28px]"
              classNames={{
                months: 'flex flex-col',
                month: 'space-y-3',
                nav: 'hidden',
                caption: 'flex justify-center pt-1 relative items-center text-sm font-semibold text-primary',
                head_row: 'flex gap-1',
                head_cell: 'text-muted-foreground/60 w-[28px] font-medium text-[0.7rem]',
                row: 'flex w-full mt-1 gap-1',
                cell: 'relative p-0 text-center text-xs focus-within:relative focus-within:z-20',
                day: cn(
                  'h-[28px] w-[28px] p-0 font-normal rounded-md aria-selected:opacity-100',
                  'hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground'
                ),
                selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                today: 'bg-primary text-primary-foreground font-bold !opacity-100',
                outside: 'invisible',
                disabled: 'text-muted-foreground opacity-20',
              }}
            />
          </div>
        );
      })}
      </div>
    </div>
  );
}
