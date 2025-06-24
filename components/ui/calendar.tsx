"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  disableFutureDates?: boolean
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  disableFutureDates = false,
  ...props
}: CalendarProps) {
  const defaultMonth = props.selected instanceof Date ? props.selected : new Date()
  const [currentMonth, setCurrentMonth] = React.useState(defaultMonth)
  
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 51 }, (_, i) => currentYear - 25 + i)

  React.useEffect(() => {
    if (props.selected instanceof Date) {
      setCurrentMonth(props.selected)
    }
  }, [props.selected])

  const handleMonthSelect = (month: string) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(parseInt(month) - 1)
    setCurrentMonth(newDate)
    props.onMonthChange?.(newDate)
  }

  const handleYearSelect = (year: string) => {
    const newDate = new Date(currentMonth)
    newDate.setFullYear(parseInt(year))
    setCurrentMonth(newDate)
    props.onMonthChange?.(newDate)
  }

  const disabledDays = React.useMemo(() => {
    if (!disableFutureDates) return undefined
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return { after: today }
  }, [disableFutureDates])

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      month={currentMonth}
      disabled={disabledDays}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRightIcon className="h-4 w-4" />,
        Caption: () => {
          return (
            <div className="flex justify-center items-center gap-2">
              <div className="flex items-center gap-1">
                <Select
                  value={(currentMonth.getMonth() + 1).toString()}
                  onValueChange={handleMonthSelect}
                >
                  <SelectTrigger className="h-7 w-[110px] text-xs font-normal">
                    <SelectValue placeholder={format(currentMonth, "MMMM")}>
                      {format(currentMonth, "MMMM")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {format(new Date(2024, i), "MMMM")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={currentMonth.getFullYear().toString()}
                  onValueChange={handleYearSelect}
                >
                  <SelectTrigger className="h-7 w-[80px] text-xs font-normal">
                    <SelectValue placeholder={currentMonth.getFullYear().toString()}>
                      {currentMonth.getFullYear()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
