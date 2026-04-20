"use client";

import { useHaptic } from "@/lib/hooks/useHaptic";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useHorizontalScroll } from "@/lib/hooks/useHorizontalScroll";
import { PROJECT_COLORS } from "@/lib/constants/colors";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  variant?: "grid" | "compact";
  label?: string;
  ariaLabel?: string;
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  variant = "grid",
  label = "Color",
  ariaLabel = "Select color",
  className,
}: ColorPickerProps) {
  const { trigger } = useHaptic();
  const scrollRef = useHorizontalScroll();

  if (variant === "compact") {
    return (
      <div
        ref={scrollRef}
        data-testid="color-picker"
        className={cn(
          "flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1 px-2 -mx-2 flex-nowrap",
          className,
        )}
        role="radiogroup"
        aria-label={ariaLabel}
      >
        {PROJECT_COLORS.map((c) => (
          <button
            key={c.hex}
            type="button"
            title={c.name}
            aria-label={c.name}
            role="radio"
            aria-checked={value === c.hex}
            onClick={() => {
              trigger("toggle");
              onChange(c.hex);
            }}
            className={cn(
              "h-7 w-7 rounded-xl transition-all shrink-0 border border-white/10",
              value === c.hex
                ? "ring-2 ring-brand ring-offset-2 ring-offset-background scale-110 opacity-100"
                : "opacity-60 hover:opacity-100 hover:scale-105",
            )}
            style={{
              backgroundColor: c.hex,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      data-testid="color-picker"
      className={cn("grid gap-1.5 w-full", className)}
    >
      {label && (
        <Label className="text-xs text-muted-foreground/60">{label}</Label>
      )}
      <div
        ref={scrollRef}
        className="flex flex-nowrap gap-2.5 overflow-x-auto scrollbar-hide py-3 px-2 -mx-2"
        role="radiogroup"
        aria-label={ariaLabel}
      >
        {PROJECT_COLORS.map((c) => (
          <button
            key={c.hex}
            type="button"
            title={c.name}
            aria-label={c.name}
            role="radio"
            aria-checked={value === c.hex}
            onClick={() => {
              trigger("toggle");
              onChange(c.hex);
            }}
            className={cn(
              "h-9 w-9 rounded-xl transition-all shrink-0 border border-white/10",
              value === c.hex
                ? "ring-2 ring-brand ring-offset-2 ring-offset-background scale-110 opacity-100"
                : "opacity-70 hover:opacity-90 hover:scale-105",
            )}
            style={{
              backgroundColor: c.hex,
            }}
          />
        ))}
      </div>
    </div>
  );
}
