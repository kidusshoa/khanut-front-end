"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateRangePickerProps {
  className?: string;
  value?: { from: Date; to: Date } | null;
  onChange: (range: { from: Date; to: Date } | null) => void;
}

export function DateRangePicker({
  className,
  value,
  onChange,
}: DateRangePickerProps) {
  const dateRange = value as DateRange | undefined;

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onChange({ from: range.from, to: range.to });
    } else if (range?.from) {
      onChange({ from: range.from, to: range.from });
    } else {
      onChange(null);
    }
  };
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {dayjs(dateRange.from).format("MMM DD, YYYY")} -{" "}
                  {dayjs(dateRange.to).format("MMM DD, YYYY")}
                </>
              ) : (
                dayjs(dateRange.from).format("MMM DD, YYYY")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Preset date ranges
export const dateRangePresets = {
  today: {
    from: new Date(),
    to: new Date(),
  },
  yesterday: {
    from: dayjs().subtract(1, "day").toDate(),
    to: dayjs().subtract(1, "day").toDate(),
  },
  last7Days: {
    from: dayjs().subtract(6, "day").toDate(),
    to: new Date(),
  },
  last30Days: {
    from: dayjs().subtract(29, "day").toDate(),
    to: new Date(),
  },
  thisMonth: {
    from: dayjs().startOf("month").toDate(),
    to: new Date(),
  },
  lastMonth: {
    from: dayjs().subtract(1, "month").startOf("month").toDate(),
    to: dayjs().startOf("month").subtract(1, "day").toDate(),
  },
};
