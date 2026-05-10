"use client"

import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar w-full rounded-xl bg-neutral-900 p-4 [--cell-radius:theme(borderRadius.lg)] [--cell-size:2.75rem]",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-full", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white select-none aria-disabled:opacity-30",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white select-none aria-disabled:opacity-30",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-9 w-full items-center justify-center",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-9 w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-lg",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "font-semibold text-white capitalize select-none",
          captionLayout === "label"
            ? "text-base"
            : "flex items-center gap-1 rounded-lg text-sm [&>svg]:size-3.5 [&>svg]:text-neutral-400",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-lg pb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-[--cell-size] select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-xs text-neutral-500 select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full rounded-lg p-0.5 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-lg",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-lg"
            : "[&:first-child[data-selected=true]_button]:rounded-l-lg",
          defaultClassNames.day
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-lg bg-amber-500/10 after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-amber-500/10",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-lg bg-amber-500/10 after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-amber-500/10",
          defaultClassNames.range_end
        ),
        today: cn(
          "rounded-lg ring-2 ring-amber-500/40 data-[selected=true]:rounded-none data-[selected=true]:ring-0",
          defaultClassNames.today
        ),
        outside: cn(
          "text-neutral-700 aria-selected:text-neutral-500",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-neutral-700 opacity-40",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon className={cn("size-4", className)} {...props} />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex aspect-square w-full items-center justify-center rounded-lg text-sm font-medium text-neutral-300 transition-all",
        "hover:bg-neutral-800 hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50",
        "data-[selected-single=true]:bg-amber-500 data-[selected-single=true]:text-neutral-900 data-[selected-single=true]:font-bold data-[selected-single=true]:shadow-lg data-[selected-single=true]:shadow-amber-500/25",
        "data-[range-start=true]:bg-amber-500 data-[range-start=true]:text-neutral-900 data-[range-start=true]:rounded-l-lg",
        "data-[range-end=true]:bg-amber-500 data-[range-end=true]:text-neutral-900 data-[range-end=true]:rounded-r-lg",
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-amber-500/10 data-[range-middle=true]:text-white",
        "disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
