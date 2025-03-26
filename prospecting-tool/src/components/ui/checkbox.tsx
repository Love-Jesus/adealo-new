import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  "aria-label"?: string
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  "aria-label": ariaLabel,
  ...props
}: CheckboxProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={disabled ? undefined : 0}
      className={cn(
        "relative flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 border-gray-400 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-300 dark:bg-gray-800",
        checked && "border-blue-600 bg-blue-600 dark:border-blue-600 dark:bg-blue-600",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={() => {
        if (!disabled && onCheckedChange) {
          onCheckedChange(!checked);
        }
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ") && onCheckedChange) {
          e.preventDefault();
          onCheckedChange(!checked);
        }
      }}
      {...props}
    >
      {checked && (
        <CheckIcon className="h-3.5 w-3.5 text-white" />
      )}
    </div>
  )
}
