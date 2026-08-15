"use client";

import { useImperativeHandle, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDateOnly } from "@/utils/date-only";

export type DatePickerHandle = {
  reset: (next?: Date) => void;
};

type DatePickerProps = {
  name: string;
  id?: string;
  value?: Date;
  placeholder?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  onChange?: (value: Date | undefined) => void;
  ref?: React.Ref<DatePickerHandle>;
};

export function DatePicker({
  name,
  id,
  value,
  placeholder = "Pick a date",
  onChange,
  ref,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: DatePickerProps) {
  const [uncontrolled, setUncontrolled] = useState<Date | undefined>(value);
  const selected = onChange ? value : uncontrolled;

  function setDate(next: Date | undefined) {
    if (!onChange) {
      setUncontrolled(next);
    }
    onChange?.(next);
  }

  useImperativeHandle(ref, () => ({
    reset(next) {
      setDate(next);
    },
  }));

  return (
    <>
      <input
        type="hidden"
        name={name}
        value={selected ? formatDateOnly(selected) : ""}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            className={cn(
              "justify-start font-normal",
              !selected && "text-muted-foreground",
            )}
          >
            <CalendarIcon data-icon="inline-start" />
            {selected ? format(selected, "PPP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={setDate}
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>
    </>
  );
}
