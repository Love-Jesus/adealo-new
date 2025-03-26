import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FieldWithHelpProps {
  label: string;
  helpText: string;
  children: ReactNode;
  optional?: boolean;
  showHelpTextBelow?: boolean;
  id?: string;
}

export function FieldWithHelp({
  label,
  helpText,
  children,
  optional = false,
  showHelpTextBelow = true,
  id
}: FieldWithHelpProps) {
  // Generate a unique ID if not provided
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label htmlFor={fieldId} className="text-foreground font-medium">
          {label}
          {optional && <span className="text-muted-foreground ml-1 font-normal">(Optional)</span>}
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help ml-1" />
            </TooltipTrigger>
            <TooltipContent side="top" align="start" className="max-w-xs">
              <p className="text-sm">{helpText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Render the form field (input, select, etc.) */}
      {children}
      
      {/* Optional help text below the field */}
      {showHelpTextBelow && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}
