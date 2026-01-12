"use client";

import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-background text-foreground",
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

type CommandDialogProps = DialogProps;

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl border-border/60 bg-background/95 backdrop-blur-xl sm:max-w-[480px] sm:rounded-lg">
        <DialogTitle className="sr-only">Command Menu</DialogTitle>
        <Command
          loop
          className="[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12"
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div
    className="flex items-center border-b border-border/50 px-4"
    cmdk-input-wrapper=""
  >
    <Search
      className="mr-3 h-5 w-5 shrink-0 text-foreground/70"
      strokeWidth={2.25}
    />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-foreground/30 disabled:cursor-not-allowed disabled:opacity-50 font-serif text-foreground",
        className
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      "max-h-[350px] overflow-y-auto overflow-x-hidden scrollbar-hide py-2 transition-seijaku",
      className
    )}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-12 text-center text-sm font-serif italic text-foreground/40"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1.5 text-foreground [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-serif [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-muted-foreground/50 [&_[cmdk-group-heading]]:tracking-[0.15em] [&_[cmdk-group-heading]]:lowercase",
      className
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-md px-3 py-2.5 text-sm transition-all duration-200 outline-none",
      // Unselected state: Deeply dim text for maximum contrast delta
      "text-muted-foreground/60 font-medium",
      // Selected state: Ink for Light Mode, Kanso Blue for Dark Mode
      // Selected state: Ink for Light Mode, Kanso Blue (Brand) for Dark Mode
      "data-[selected=true]:bg-foreground/10 data-[selected=true]:!text-foreground aria-selected:bg-foreground/10 aria-selected:!text-foreground",
      "dark:data-[selected=true]:bg-brand/20 dark:data-[selected=true]:!text-primary-foreground dark:aria-selected:bg-brand/20 dark:aria-selected:!text-primary-foreground",
      // Force font weight and icon colors
      "data-[selected=true]:!font-bold aria-selected:!font-bold",
      "data-[selected=true]:[&_svg]:!text-foreground aria-selected:[&_svg]:!text-foreground",
      "dark:data-[selected=true]:[&_svg]:!text-primary-foreground dark:aria-selected:[&_svg]:!text-primary-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground/60",
        className
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
