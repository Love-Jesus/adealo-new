import { useState } from "react";
import { Widget } from "./widget-types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Clock, MousePointer, LogOut } from "lucide-react";

interface BehaviorTabProps {
  behavior: Widget['behavior'];
  onChange: (behavior: Widget['behavior']) => void;
}

export function BehaviorTab({ behavior, onChange }: BehaviorTabProps) {
  // Trigger options
  const triggerOptions = [
    { value: "time", label: "Time Delay", icon: Clock },
    { value: "scroll", label: "Scroll Percentage", icon: MousePointer },
    { value: "exit", label: "Exit Intent", icon: LogOut },
  ];
  
  // Frequency options
  const frequencyOptions = [
    { value: "once", label: "Once per visitor" },
    { value: "always", label: "Every visit" },
    { value: "custom", label: "Custom" },
  ];
  
  // Handle trigger change
  const handleTriggerChange = (trigger: Widget['behavior']['trigger']) => {
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
  
  return (
    <div className="space-y-6">
      {/* Trigger Type */}
      <div className="space-y-2">
        <Label>Trigger Type</Label>
        <div className="grid grid-cols-3 gap-2">
          {triggerOptions.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleTriggerChange(option.value as Widget['behavior']['trigger'])}
                className={`flex flex-col items-center justify-center gap-2 p-4 border rounded-md ${
                  behavior.trigger === option.value 
                    ? 'bg-primary text-white' 
                    : 'bg-background hover:bg-muted/50'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Time Delay (if trigger is time) */}
      {behavior.trigger === 'time' && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="time-delay">Time Delay</Label>
            <span className="text-sm text-muted-foreground">{behavior.delay} seconds</span>
          </div>
          <Slider
            id="time-delay"
            min={0}
            max={60}
            step={1}
            value={[behavior.delay]}
            onValueChange={handleDelayChange}
          />
          <p className="text-xs text-muted-foreground">
            Widget will appear after the specified number of seconds
          </p>
        </div>
      )}
      
      {/* Scroll Percentage (if trigger is scroll) */}
      {behavior.trigger === 'scroll' && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="scroll-percentage">Scroll Percentage</Label>
            <span className="text-sm text-muted-foreground">{behavior.scrollPercentage || 50}%</span>
          </div>
          <Slider
            id="scroll-percentage"
            min={10}
            max={100}
            step={5}
            value={[behavior.scrollPercentage || 50]}
            onValueChange={handleScrollPercentageChange}
          />
          <p className="text-xs text-muted-foreground">
            Widget will appear when user scrolls to this percentage of the page
          </p>
        </div>
      )}
      
      {/* Exit Intent (if trigger is exit) */}
      {behavior.trigger === 'exit' && (
        <div className="p-4 bg-muted/30 rounded-md">
          <p className="text-sm">
            Widget will appear when the user's mouse leaves the browser window, indicating they might be about to leave the page.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Exit intent detection only works on desktop devices.
          </p>
        </div>
      )}
      
      {/* Display Frequency */}
      <div className="space-y-2">
        <Label htmlFor="frequency">Display Frequency</Label>
        <Select 
          value={behavior.frequency} 
          onValueChange={(value) => onChange({...behavior, frequency: value as Widget['behavior']['frequency']})}
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
        <p className="text-xs text-muted-foreground">
          {behavior.frequency === 'once' && "Widget will only be shown once per visitor (uses cookies)"}
          {behavior.frequency === 'always' && "Widget will be shown on every page visit"}
          {behavior.frequency === 'custom' && "Custom frequency settings can be configured in the code snippet"}
        </p>
      </div>
      
      {/* Mobile Display */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="mobile-display" className="block">Display on Mobile</Label>
          <p className="text-xs text-muted-foreground">
            Show widget on mobile devices
          </p>
        </div>
        <Switch 
          id="mobile-display"
          checked={behavior.displayOnMobile}
          onCheckedChange={handleMobileDisplayChange}
        />
      </div>
    </div>
  );
}
