'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useTimer } from '@/components/TimerProvider';

// Extracted settings form component to prevent recreation on every render
function SettingsForm({
  focusDuration,
  setFocusDuration,
  shortBreak,
  setShortBreak,
  longBreak,
  setLongBreak,
  sessions,
  setSessions
}: {
  focusDuration: number;
  setFocusDuration: (value: number) => void;
  shortBreak: number;
  setShortBreak: (value: number) => void;
  longBreak: number;
  setLongBreak: (value: number) => void;
  sessions: number;
  setSessions: (value: number) => void;
}) {
  return (
    <div className="space-y-6 py-4">
      {/* Focus Duration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Focus Duration</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={focusDuration}
              onChange={(e) => setFocusDuration(Number(e.target.value))}
              className="w-16 h-8 text-sm bg-secondary/30 border-transparent hover:bg-secondary/50 text-center rounded-md"
              min={1}
              max={120}
            />
            <span className="text-sm text-muted-foreground">min</span>
          </div>
        </div>
        <Slider
          value={[focusDuration]}
          onValueChange={([value]) => setFocusDuration(value)}
          min={1}
          max={120}
          step={5}
          className="w-full"
        />
      </div>

      {/* Short Break */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Short Break</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={shortBreak}
              onChange={(e) => setShortBreak(Number(e.target.value))}
              className="w-16 h-8 text-sm bg-secondary/30 border-transparent hover:bg-secondary/50 text-center rounded-md"
              min={1}
              max={30}
            />
            <span className="text-sm text-muted-foreground">min</span>
          </div>
        </div>
        <Slider
          value={[shortBreak]}
          onValueChange={([value]) => setShortBreak(value)}
          min={1}
          max={30}
          step={1}
          className="w-full"
        />
      </div>

      {/* Long Break */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Long Break</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={longBreak}
              onChange={(e) => setLongBreak(Number(e.target.value))}
              className="w-16 h-8 text-sm bg-secondary/30 border-transparent hover:bg-secondary/50 text-center rounded-md"
              min={5}
              max={60}
            />
            <span className="text-sm text-muted-foreground">min</span>
          </div>
        </div>
        <Slider
          value={[longBreak]}
          onValueChange={([value]) => setLongBreak(value)}
          min={5}
          max={60}
          step={5}
          className="w-full"
        />
      </div>

      {/* Sessions Before Long Break */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Sessions Until Long Break</Label>
          <Input
            type="number"
            value={sessions}
            onChange={(e) => setSessions(Number(e.target.value))}
            className="w-16 h-8 text-sm bg-secondary/30 border-transparent hover:bg-secondary/50 text-center rounded-md"
            min={2}
            max={10}
          />
        </div>
        <Slider
          value={[sessions]}
          onValueChange={([value]) => setSessions(value)}
          min={2}
          max={10}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
}

export function FocusSettingsDialog() {
  const { settings, updateSettings } = useTimer();
  const { trigger, isPhone } = useHaptic();
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Local state for form
  const [focusDuration, setFocusDuration] = useState(settings.focusDuration);
  const [shortBreak, setShortBreak] = useState(settings.shortBreakDuration);
  const [longBreak, setLongBreak] = useState(settings.longBreakDuration);
  const [sessions, setSessions] = useState(settings.sessionsBeforeLongBreak);



  const handleSave = () => {
    trigger(40);
    updateSettings({
      focusDuration,
      shortBreakDuration: shortBreak,
      longBreakDuration: longBreak,
      sessionsBeforeLongBreak: sessions,
    });
    setOpen(false);
  };

  const handleCancel = () => {
    trigger(10);
    setOpen(false);
  };



  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <motion.button
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 active:bg-accent/50 transition-all cursor-pointer"
            )}
            onTapStart={() => trigger(50)}
            whileTap={isPhone ? { scale: 0.95 } : {}}
          >
            <Settings className="h-4 w-4 mr-2" />
            Adjust Settings
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Timer Settings</DialogTitle>
            <DialogDescription>
              Customize your focus and break durations
            </DialogDescription>
          </DialogHeader>
          <SettingsForm 
            focusDuration={focusDuration}
            setFocusDuration={setFocusDuration}
            shortBreak={shortBreak}
            setShortBreak={setShortBreak}
            longBreak={longBreak}
            setLongBreak={setLongBreak}
            sessions={sessions}
            setSessions={setSessions}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <motion.button
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 active:bg-accent/50 transition-all cursor-pointer"
          )}
          onTapStart={() => trigger(50)}
          whileTap={isPhone ? { scale: 0.95 } : {}}
        >
          <Settings className="h-4 w-4 mr-2" />
          Adjust Settings
        </motion.button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Timer Settings</DrawerTitle>
          <DrawerDescription>
            Customize your focus and break durations
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <SettingsForm 
            focusDuration={focusDuration}
            setFocusDuration={setFocusDuration}
            shortBreak={shortBreak}
            setShortBreak={setShortBreak}
            longBreak={longBreak}
            setLongBreak={setLongBreak}
            sessions={sessions}
            setSessions={setSessions}
          />
        </div>
        <DrawerFooter className="pt-2">
          <Button onClick={handleSave}>Save Changes</Button>
          <DrawerClose asChild>
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
