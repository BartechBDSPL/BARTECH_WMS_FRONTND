import React from "react";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DateTimePickerProps {
  label: string;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ label, value, onChange }) => {
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const newDate = value
        ? new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            value.getHours(),
            value.getMinutes()
          )
        : new Date(date.setHours(0, 0, 0, 0)); // Default to 00:00 if no time
      onChange(newDate);
    } else {
      onChange(undefined);
    }
  };

  const handleTimeChange = (time: string) => {
    if (time && value) {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes);
      onChange(newDate);
    } else if (time) {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date();
      newDate.setHours(hours, minutes);
      onChange(newDate);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP HH:mm") : <span>Pick a {label.toLowerCase()}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4">
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateChange}
              initialFocus
            />
            <Input
              type="time"
              value={value ? format(value, "HH:mm") : ""}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateTimePicker;