"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/format";

export function QuantityStepper({
  value,
  min = 1,
  max = 10,
  onChange,
  label = "Quantity",
  compact = false,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  label?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] border border-line-strong bg-paper",
        compact ? "h-8" : "h-11",
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={cn(
          "grid place-items-center text-ink transition-colors hover:bg-canvas disabled:opacity-35",
          compact ? "h-8 w-8" : "h-11 w-11",
        )}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        <Minus size={compact ? 12 : 14} strokeWidth={1.75} />
      </button>
      <span
        className={cn("num text-center tabular-nums", compact ? "w-6 text-xs" : "w-8 text-sm")}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={cn(
          "grid place-items-center text-ink transition-colors hover:bg-canvas disabled:opacity-35",
          compact ? "h-8 w-8" : "h-11 w-11",
        )}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <Plus size={compact ? 12 : 14} strokeWidth={1.75} />
      </button>
    </div>
  );
}
