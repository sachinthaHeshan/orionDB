import { forwardRef, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const BaseNode = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { selected?: boolean }
>(({ className, selected, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-md border bg-white dark:bg-gray-900 p-5 text-foreground shadow-md",
      className,
      selected
        ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
        : "border-gray-300 dark:border-gray-600",
      "hover:ring-1 hover:ring-gray-400"
    )}
    tabIndex={0}
    {...props}
  />
));

BaseNode.displayName = "BaseNode";
