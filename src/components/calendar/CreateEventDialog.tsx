"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Trash2 } from "lucide-react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateTimeWizard } from "@/components/ui/date-time-wizard";
import {
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from "@/lib/hooks/useCalendarEventMutations";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { parseEventInput } from "@/lib/utils/nlp-event";
import { cn } from "@/lib/utils";
import type { CalendarEventUI } from "@/lib/types/calendar-event";

const CreateEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  all_day: z.boolean().default(false),
});

type CreateEventFormData = z.infer<typeof CreateEventSchema>;

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  event?: CalendarEventUI;
}

export function CreateEventDialog({
  open,
  onOpenChange,
  defaultDate,
  event,
}: CreateEventDialogProps) {
  const { trigger } = useHaptic();
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  const [startDate, setStartDate] = useState<Date | undefined>(
    event?.start || defaultDate || new Date(),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    if (event?.end) return event.end;
    const d = defaultDate || new Date();
    // Default to 1 hour after start
    return new Date(d.getTime() + 3600000);
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(CreateEventSchema) as any,
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      location: "",
      all_day: false,
    },
  });

  const allDay = useWatch({ control, name: "all_day" });
  const title = useWatch({ control, name: "title" });

  // NLP parsing on title change (only when creating)
  useEffect(() => {
    if (event || !title || title.length < 3) return;

    // Use title as NLP input
    const parsed = parseEventInput(title);
    const start = parsed.start;
    const end = parsed.end;
    const isAllDay = parsed.allDay;

    if (start) {
      const timer = setTimeout(() => {
        setStartDate(start);
        // Update end date to 1 hour after or use parsed end
        setEndDate(end || new Date(start.getTime() + 3600000));
        if (isAllDay) {
          setValue("all_day", true);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [title, setValue, event]);

  // Reset/Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (event) {
          setStartDate(event.start);
          setEndDate(event.end);
          reset({
            title: event.title,
            description: event.description || "",
            location: event.location || "",
            all_day: event.allDay || false,
          });
        } else {
          const now = defaultDate || new Date();
          setStartDate(now);
          setEndDate(new Date(now.getTime() + 3600000));
          reset({
            title: "",
            description: "",
            location: "",
            all_day: false,
          });
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, defaultDate, event, reset]);

  const onFormSubmit = (data: CreateEventFormData) => {
    if (!startDate || !endDate) return;

    trigger("HEAVY"); // THUD haptic for save commitment

    if (event) {
      updateEvent.mutate({
        id: event.id,
        title: data.title,
        description: data.description || undefined,
        location: data.location || undefined,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        all_day: data.all_day,
      });
    } else {
      createEvent.mutate({
        title: data.title,
        description: data.description || undefined,
        location: data.location || undefined,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        all_day: data.all_day,
      });
    }

    trigger("SUCCESS");
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!event) return;
    trigger("HEAVY");
    deleteEvent.mutate(event.id);
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <form
          onSubmit={handleSubmit(onFormSubmit) as any}
          className="flex flex-col h-auto max-h-[90dvh]"
        >
          <ResponsiveDialogHeader className="px-4 pt-6 shrink-0">
            <ResponsiveDialogTitle className="type-h2">
              {event ? "Edit Event" : "Create Event"}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="sr-only">
              Add a new event to your calendar
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-4">
            {/* Title with NLP */}
            <div className="grid gap-2">
              <Label htmlFor="event-title" className="sr-only">
                Event Title
              </Label>
              <Input
                {...register("title")}
                id="event-title"
                placeholder="Lunch at 1pm tomorrow..."
                autoFocus
                className={cn(
                  "text-lg font-medium",
                  errors.title && "border-destructive",
                )}
              />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* All Day Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="all-day" className="text-sm font-medium">
                All day
              </Label>
              <Switch
                id="all-day"
                checked={allDay}
                onCheckedChange={(checked) => {
                  trigger("MEDIUM"); // TOGGLE haptic
                  setValue("all_day", checked);
                }}
              />
            </div>

            {/* Start Date/Time */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Start</Label>
              <Popover open={showStartPicker} onOpenChange={setShowStartPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal shadow-none border-border/80"
                    onClick={() => trigger("LIGHT")}
                    type="button"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate
                      ? allDay
                        ? format(startDate, "PPP")
                        : format(startDate, "PPP p")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DateTimeWizard
                    date={startDate}
                    setDate={setStartDate}
                    onClose={() => setShowStartPicker(false)}
                    showTime={!allDay}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date/Time */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">End</Label>
              <Popover open={showEndPicker} onOpenChange={setShowEndPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal shadow-none border-border/80"
                    onClick={() => trigger("LIGHT")}
                    type="button"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {endDate
                      ? allDay
                        ? format(endDate, "PPP")
                        : format(endDate, "PPP p")
                      : "Pick an end time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DateTimeWizard
                    date={endDate}
                    setDate={setEndDate}
                    onClose={() => setShowEndPicker(false)}
                    showTime={!allDay}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label htmlFor="event-location" className="text-sm font-medium">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("location")}
                  id="event-location"
                  placeholder="Add location"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label
                htmlFor="event-description"
                className="text-sm font-medium"
              >
                Notes
              </Label>
              <Textarea
                {...register("description")}
                id="event-description"
                placeholder="Add notes..."
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 flex justify-end gap-3 p-4 border-t pb-[calc(1rem+env(safe-area-inset-bottom))] bg-background">
            {event && (
              <Button
                type="button"
                variant="ghost"
                className="mr-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
                disabled={deleteEvent.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span>Delete</span>
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                trigger("LIGHT");
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !isValid ||
                !startDate ||
                !endDate ||
                createEvent.isPending ||
                updateEvent.isPending
              }
              className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-lg shadow-brand/10 transition-seijaku h-10 px-6"
            >
              {createEvent.isPending || updateEvent.isPending
                ? event
                  ? "Updating..."
                  : "Creating..."
                : event
                  ? "Save Changes"
                  : "Create Event"}
            </Button>
          </div>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
