"use client";
// Remplacement de react-day-picker par une implémentation basée sur date-fns

import * as React from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  format,
  isToday,
  type Locale,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export interface CalendarProps {
  selected?: Date | null;
  onSelect?: (date: Date) => void;
  locale?: Locale;
  className?: string;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
  mode?: "single";
}

export function Calendar({
  selected,
  onSelect,
  locale = fr,
  className,
  disabled,
  initialFocus,
}: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    selected && isSameMonth(selected, today) ? selected : today
  );

  // Pour focus initial sur le jour sélectionné
  const selectedRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (initialFocus && selectedRef.current) {
      selectedRef.current.focus();
    }
  }, [initialFocus, currentMonth]);

  const startMonth = startOfMonth(currentMonth);
  const endMonth = endOfMonth(currentMonth);

  // Génère les semaines du mois courant
  const weeks: Date[][] = [];
  let weekStart = startOfWeek(startMonth, { locale });
  let weekEnd = endOfWeek(weekStart, { locale });

  while (weekStart <= endMonth) {
    const days: Date[] = [];
    for (let d = 0; d < 7; d++) {
      days.push(addDays(weekStart, d));
    }
    weeks.push(days);
    weekStart = addDays(weekEnd, 1);
    weekEnd = endOfWeek(weekStart, { locale });
  }

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const isDayDisabled = (date: Date) => {
    if (disabled) return disabled(date);
    return false;
  };

  return (
    <div className={cn("bg-background-component inline-block rounded-lg border  p-3 text-popover-foreground shadow-md", className)}>
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          className={cn(buttonVariants({ variant: "ghost", color: "secondary" }), "size-9 p-0")}
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-sm font-medium">
          {format(currentMonth, "MMMM yyyy", { locale })}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className={cn(buttonVariants({ variant: "ghost", color: "secondary" }), "size-9 p-0")}
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {Array.from({ length: 7 }).map((_, i) => {
          const day = addDays(startOfWeek(today, { locale }), i);
          return (
            <div key={i} className="text-xs font-bold text-secondary text-muted-foreground/80 flex justify-center">
              {format(day, "EEEEE", { locale })}
            </div>
          );
        })}
      </div>
      <div className="grid grid-rows-6 grid-cols-7 gap-1">
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const isSelected = selected && isSameDay(day, selected);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isDisabled = isDayDisabled(day);
            const isCurrentDay = isToday(day);

            return (
              <button
                key={wi + "-" + di}
                type="button"
                onClick={() => !isDisabled && onSelect?.(day)}
                disabled={isDisabled || !isCurrentMonth}
                ref={isSelected ? selectedRef : undefined}
                className={cn(
                  "relative flex size-9 items-center justify-center rounded-lg text-sm outline-none transition-colors",
                  isSelected
                    ? "bg-secondary text-secondary-foreground"
                    : isCurrentDay
                    ? "border border-secondary"
                    : "",
                  !isCurrentMonth && "text-foreground/30",
                  isDisabled && "text-foreground/30 line-through pointer-events-none",
                  "hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                )}
                aria-label={format(day, "PPP", { locale })}
                tabIndex={isSelected ? 0 : -1}
              >
                {format(day, "d", { locale })}
                {isCurrentDay && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-secondary" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

