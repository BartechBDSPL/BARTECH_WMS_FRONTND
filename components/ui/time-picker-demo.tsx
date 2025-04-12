"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { TimePickerInput } from "./time-picker-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimePickerDemoProps {
  date: Date | undefined;
  setDate: (date: Date) => void;
}

export function TimePickerDemo({ date, setDate }: TimePickerDemoProps) {
  const initialDate = date || new Date();
  const [hours, setHours] = React.useState<number>(
    initialDate.getHours() > 12 
      ? initialDate.getHours() - 12 
      : initialDate.getHours() === 0 
        ? 12 
        : initialDate.getHours()
  );
  const [minutes, setMinutes] = React.useState<number>(initialDate.getMinutes());
  const [period, setPeriod] = React.useState<"AM" | "PM">(
    initialDate.getHours() >= 12 ? "PM" : "AM"
  );

  React.useEffect(() => {
    if (date) {
      const newHours = date.getHours();
      setHours(newHours > 12 ? newHours - 12 : newHours === 0 ? 12 : newHours);
      setMinutes(date.getMinutes());
      setPeriod(date.getHours() >= 12 ? "PM" : "AM");
    }
  }, [date]);

  React.useEffect(() => {
    try {
      const newDate = new Date();
      let adjustedHours = hours;
      if (period === "PM" && hours !== 12) adjustedHours += 12;
      if (period === "AM" && hours === 12) adjustedHours = 0;

      newDate.setHours(adjustedHours);
      newDate.setMinutes(minutes);
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      setDate(newDate);
    } catch (error) {
      console.error("Error updating date:", error);
    }
  }, [hours, minutes, period, setDate]);

  return (
    <div className="flex gap-2">
      <Select value={hours.toString()} onValueChange={(value: string) => setHours(parseInt(value))}>
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
            <SelectItem key={hour} value={hour.toString()}>
              {hour.toString().padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={minutes.toString()} onValueChange={(value: string) => setMinutes(parseInt(value))}>
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Minutes" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
            <SelectItem key={minute} value={minute.toString()}>
              {minute.toString().padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={period} onValueChange={(value: string) => setPeriod(value as "AM" | "PM")}>
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}