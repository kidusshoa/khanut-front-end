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

interface DateRangePickerProps {
  className?: string;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  dateRange,
  onDateRangeChange,
}: DateRangePickerProps) {
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
            onSelect={onDateRangeChange}
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
