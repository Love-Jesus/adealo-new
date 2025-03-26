import { Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export function ProgressIndicator({ steps, currentStep, onStepClick }: ProgressIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Step labels */}
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`
                    flex items-center cursor-pointer
                    ${index === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}
                  `}
                  onClick={() => onStepClick && onStepClick(index)}
                >
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full mr-2 transition-colors
                    ${index === currentStep ? 'bg-primary text-white' : 
                      index < currentStep ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
                  `}>
                    {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className="text-sm hidden md:inline">{step}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{step}</p>
                <p className="text-xs text-muted-foreground">
                  {index < currentStep ? 'Completed' : 
                   index === currentStep ? 'Current step' : 'Upcoming step'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      
      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>
      
      {/* Current step description */}
      <div className="mt-2 text-center">
        <p className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}: <span className="text-foreground font-medium">{steps[currentStep]}</span>
        </p>
      </div>
    </div>
  );
}
