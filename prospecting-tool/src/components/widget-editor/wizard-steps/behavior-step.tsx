import { useEffect } from "react";
import { Widget } from "../widget-types";
import { FieldWithHelp } from "../field-with-help";
import { 
  Clock, 
  MousePointer, 
  LogOut,
  Smartphone,
  Info
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface BehaviorStepProps {
  behavior: Widget['behavior'];
  onChange: (behavior: Widget['behavior']) => void;
  onValidChange: (isValid: boolean) => void;
}

export function BehaviorStep({ behavior, onChange, onValidChange }: BehaviorStepProps) {
  // Trigger options
  const triggerOptions = [
    { value: "time", label: "Time Delay", icon: Clock, description: "Show after a specific time delay" },
    { value: "scroll", label: "Scroll Position", icon: MousePointer, description: "Show when user scrolls to a certain point" },
    { value: "exit", label: "Exit Intent", icon: LogOut, description: "Show when user is about to leave the page" },
  ];
  
  // Frequency options
  const frequencyOptions = [
    { value: "once", label: "Once per visitor" },
    { value: "always", label: "Every page visit" },
    { value: "custom", label: "Custom frequency" },
  ];
  
  // Handle trigger change
  const handleTriggerChange = (trigger: 'time' | 'scroll' | 'exit') => {
    onChange({
      ...behavior,
      trigger
    });
  };
  
  // Handle delay change
  const handleDelayChange = (value: number[]) => {
    onChange({
      ...behavior,
      delay: value[0]
    });
  };
  
  // Handle scroll percentage change
  const handleScrollPercentageChange = (value: number[]) => {
    onChange({
      ...behavior,
      scrollPercentage: value[0]
    });
  };
  
  // Handle mobile display toggle
  const handleMobileDisplayChange = (checked: boolean) => {
    onChange({
      ...behavior,
      displayOnMobile: checked
    });
  };
  
  // Validate behavior settings
  useEffect(() => {
    const isValid = behavior.trigger !== undefined;
    onValidChange(isValid);
  }, [behavior, onValidChange]);
  
  return (
    <div className="space-y-8">
      {/* Trigger Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">When to Show the Widget</h3>
        <p className="text-muted-foreground">
          Choose when your widget appears to visitors
        </p>
        
        <div className="grid grid-cols-1 gap-3 mt-4">
          {triggerOptions.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleTriggerChange(option.value as 'time' | 'scroll' | 'exit')}
                className={`flex items-start p-4 border rounded-md text-left ${
                  behavior.trigger === option.value 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-background hover:bg-muted/50'
                }`}
              >
                <Icon className={`h-5 w-5 mt-0.5 mr-3 ${
                  behavior.trigger === option.value ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Trigger-specific settings */}
      {behavior.trigger === 'time' && (
        <div className="space-y-4 p-4 bg-muted/10 rounded-md border">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Time Delay</h4>
            <span className="text-sm font-medium">{behavior.delay} seconds</span>
          </div>
          <Slider
            min={1}
            max={30}
            step={1}
            value={[behavior.delay]}
            onValueChange={handleDelayChange}
          />
          <p className="text-sm text-muted-foreground">
            The widget will appear {behavior.delay} seconds after the page loads
          </p>
        </div>
      )}
      
      {behavior.trigger === 'scroll' && (
        <div className="space-y-4 p-4 bg-muted/10 rounded-md border">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Scroll Percentage</h4>
            <span className="text-sm font-medium">{behavior.scrollPercentage || 50}%</span>
          </div>
          <Slider
            min={10}
            max={100}
            step={5}
            value={[behavior.scrollPercentage || 50]}
            onValueChange={handleScrollPercentageChange}
          />
          <p className="text-sm text-muted-foreground">
            The widget will appear when the user scrolls {behavior.scrollPercentage || 50}% down the page
          </p>
        </div>
      )}
      
      {/* Frequency */}
      <FieldWithHelp
        label="Display Frequency"
        helpText="How often to show the widget to the same visitor"
        id="frequency"
      >
        <Select 
          value={behavior.frequency} 
          onValueChange={(value) => onChange({...behavior, frequency: value as 'once' | 'always' | 'custom'})}
        >
          <SelectTrigger id="frequency">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            {frequencyOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldWithHelp>
      
      {/* Mobile Display */}
      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <Label htmlFor="mobile-display" className="text-base font-medium">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span>Show on Mobile Devices</span>
            </div>
          </Label>
          <p className="text-sm text-muted-foreground">
            Display the widget on smartphones and tablets
          </p>
        </div>
        <Switch
          id="mobile-display"
          checked={behavior.displayOnMobile}
          onCheckedChange={handleMobileDisplayChange}
        />
      </div>
      
      {/* Behavior Tips */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4 mt-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-700 dark:text-amber-300">Behavior Tips</h4>
            <ul className="text-sm text-amber-600 dark:text-amber-400 mt-1 space-y-1 list-disc pl-4">
              <li>Time delay of 5-10 seconds works best for most websites</li>
              <li>Exit intent can help capture visitors before they leave</li>
              <li>Consider disabling on mobile if your widget is large</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
