'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { LargeTimePicker } from '@/components/ui/large-time-picker';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Clock, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimeWizardProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  onClose: () => void;
}

export function DateTimeWizard({ date, setDate, onClose }: DateTimeWizardProps) {
  const [step, setStep] = useState<'date' | 'time'>('date');


  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setDate(undefined);
      return;
    }
    
    // Preserve time if already set, or set default time (12:00 PM / Noon)
    const updatedDate = new Date(newDate);
    if (date) {
      // Date already exists, keep its time
      updatedDate.setHours(date.getHours(), date.getMinutes());
    } else {
      // New date, default to 12:00 PM (noon) instead of 9 AM
      updatedDate.setHours(12, 0, 0, 0);
    }
    
    setDate(updatedDate);
    // Auto-advance to time picker after short delay for visual confirmation
    setTimeout(() => setStep('time'), 250);
  };

  const handleTimeChange = (newTime: Date) => {
    // LargeTimePicker returns a Date object with correct time parts

    setDate(newTime);
  };

  // If we open wizard and date is already set, maybe start on Date but user can switch?
  // Let's stick to Date first.

  return (
    <div className="flex flex-col w-full max-w-[320px] mx-auto bg-popover rounded-md overflow-hidden">
      {/* Header / Tabs */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/40">
        <Tabs 
          value={step} 
          onValueChange={(v) => setStep(v as 'date' | 'time')} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 h-9 p-0.5 bg-muted/50">
            <TabsTrigger 
              value="date" 
              className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-sm"
            >
              <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
              {date ? format(date, 'MMM d') : 'Date'}
            </TabsTrigger>
            <TabsTrigger 
              value="time" 
              className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-sm"
              disabled={!date} // Can't pick time without date
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              {date ? format(date, 'h:mm a') : 'Time'}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area */}
      <div className="p-2 sm:p-3">
        {step === 'date' ? (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
              captionLayout="dropdown"
              fromYear={new Date().getFullYear() - 1}
              toYear={new Date().getFullYear() + 5}
              initialFocus
              className="rounded-md border-0 w-full flex justify-center p-3"
              classNames={{
                  month: 'space-y-4 w-full',
                  table: 'w-full border-collapse space-y-1',
                  head_row: 'flex w-full justify-between',
                  row: 'flex w-full justify-between mt-2',

                  day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent hover:text-accent-foreground',
                  head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center',
              }}
            />
            <div className="mt-4 flex justify-end">
                <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-xs gap-1"
                    onClick={() => {
                        if (date) setStep('time');
                    }}
                    disabled={!date}
                >
                    Set Time <ArrowRight className="w-3 h-3" />
                </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in slide-in-from-right-5 fade-in duration-200">
             <div className="text-sm font-medium text-muted-foreground mb-4">
                Set Time for {date && format(date, 'MMMM d')}
             </div>
             
             {date && (
               <LargeTimePicker 
                 value={date} 
                 onChange={handleTimeChange} 
               />
             )}
             
             <div className="mt-4 w-full flex justify-between">
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setStep('date')}
                >
                    Back
                </Button>
                <Button 
                    size="sm"
                    className="gap-1.5"
                    onClick={onClose}
                >
                    <Check className="w-3.5 h-3.5" />
                    Done
                </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
