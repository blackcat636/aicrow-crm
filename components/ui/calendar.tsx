import * as React from "react";
import { DayPicker } from "react-day-picker";
import { uk } from "date-fns/locale";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const baseClassNames: CalendarProps["classNames"] = {
  months: "flex flex-col gap-3",
  month: "bg-popover text-popover-foreground rounded-lg border border-border shadow-sm p-3",
  caption: "flex items-center justify-between",
  caption_label: "hidden",
  caption_dropdowns: "flex items-center gap-2 text-sm font-medium",
  dropdown: "relative",
  dropdown_month: "inline-flex h-8 items-center gap-1 rounded-md border border-input bg-transparent px-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  dropdown_year: "inline-flex h-8 items-center gap-1 rounded-md border border-input bg-transparent px-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  nav: "flex items-center gap-1",
  nav_button: cn(
    "inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-transparent p-0 text-muted-foreground transition-colors",
    "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  ),
  nav_button_previous: "",
  nav_button_next: "",
  table: "w-full border-collapse",
  head_row: "grid grid-cols-7 gap-0 px-0",
  head_cell: "flex h-8 items-center justify-center text-xs font-normal text-muted-foreground",
  row: "grid grid-cols-7 gap-0",
  cell: cn(
    "relative flex h-9 w-9 items-center justify-center text-center text-sm",
    "focus-within:relative focus-within:z-20"
  ),
  day: cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-normal transition-colors",
    "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  ),
  day_selected: "bg-primary text-primary-foreground shadow",
  day_today: "border border-primary text-primary",
  day_outside: "text-muted-foreground opacity-50",
  day_disabled: "text-muted-foreground opacity-50",
  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
  day_hidden: "invisible"
};

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale,
  captionLayout,
  ...props
}: CalendarProps) {
  const mergedClassNames = {
    ...baseClassNames,
    ...classNames,
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale ?? uk}
      captionLayout={captionLayout ?? "dropdown"}
      className={cn("text-sm", className)}
      classNames={mergedClassNames}
      {...props}
    />
  );
}
