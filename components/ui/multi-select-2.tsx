"use client";
import React, { useState, useCallback } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DropdownOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: { value: string; label: string }[];
  values: string[]; // This is expecting string[], not objects
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allowCustomValue?: boolean;
  onCustomValueChange?: (value: string) => void;
}


export const MultiSelect2: React.FC<MultiSelectProps> = ({
  options = [],
  values = [],
  onValuesChange,
  onCustomValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No options available",
  //disabled = false,
  allowCustomValue = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const safeOptions = Array.isArray(options) ? options : [];

  const selectedLabels = safeOptions
    .filter((opt) => values.includes(opt.value))
    .map((opt) => opt.label);

  const displayLabel = selectedLabels.length > 0
    ? selectedLabels.join(", ")
    : placeholder;

  const filteredOptions = safeOptions.filter(
    (option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isExactMatch = useCallback(() => {
    return safeOptions.some(
      (option) =>
        option.label.toLowerCase() === searchQuery.toLowerCase() ||
        option.value.toLowerCase() === searchQuery.toLowerCase()
    );
  }, [safeOptions, searchQuery]);

  const handleSelect = (selected: string) => {
    if (values.includes(selected)) {
      onValuesChange(values.filter((v) => v !== selected));
    } else {
      onValuesChange([...values, selected]);
    }
  };

  const handleAddCustomValue = () => {
    if (searchQuery) {
      onValuesChange([...values, searchQuery]);
      if (onCustomValueChange) {
        onCustomValueChange(searchQuery);
      }
      setSearchQuery("");
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      allowCustomValue &&
      searchQuery &&
      filteredOptions.length === 0
    ) {
      e.preventDefault();
      handleAddCustomValue();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        //  disabled={disabled}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
            onKeyDown={handleKeyDown}
          />
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {allowCustomValue && searchQuery && !isExactMatch() && (
              <CommandItem
                onSelect={handleAddCustomValue}
                className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add &quot;{searchQuery}&quot;
              </CommandItem>
            )}

            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => handleSelect(option.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    values.includes(option.value)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>

          {filteredOptions.length === 0 && !searchQuery && (
            <CommandEmpty>{emptyText}</CommandEmpty>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};
