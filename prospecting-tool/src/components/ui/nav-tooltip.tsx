import * as React from "react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"

interface NavTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  description?: string
  className?: string
}

export function NavTooltip({ 
  children, 
  content, 
  description, 
  className 
}: NavTooltipProps) {
  const { state, isHovered } = useSidebar();
  
  // Don't show tooltip when sidebar is expanded or when it's hovered in collapsed state
  const shouldShowTooltip = state === "collapsed" && !isHovered;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent 
          side="right" 
          align="start" 
          sideOffset={20}
          className={cn(
            "bg-background border border-border/50 shadow-md p-0 text-foreground w-[280px]",
            className
          )}
          hidden={!shouldShowTooltip}
        >
          <div className="p-4">
            <div className="font-medium text-sm">{content}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
