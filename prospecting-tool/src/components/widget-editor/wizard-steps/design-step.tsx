import { useEffect } from "react";
import { Widget } from "../widget-types";
import { FieldWithHelp } from "../field-with-help";
import { ColorSchemePresets, colorPresets } from "../design-presets";
import { 
  CornerDownLeft, 
  CornerDownRight, 
  CornerUpLeft, 
  CornerUpRight,
  Palette
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface DesignStepProps {
  design: Widget['design'];
  onChange: (design: Widget['design']) => void;
  onValidChange: (isValid: boolean) => void;
}

export function DesignStep({ design, onChange, onValidChange }: DesignStepProps) {
  // Position options
  const positionOptions = [
    { value: "bottom-right", label: "Bottom Right", icon: CornerDownRight },
    { value: "bottom-left", label: "Bottom Left", icon: CornerDownLeft },
    { value: "top-right", label: "Top Right", icon: CornerUpRight },
    { value: "top-left", label: "Top Left", icon: CornerUpLeft },
  ];
  
  // Theme options
  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];
  
  // Handle color change
  const handleColorChange = (color: string, type: 'primaryColor' | 'secondaryColor') => {
    onChange({
      ...design,
      [type]: color
    });
  };
  
  // Handle position change
  const handlePositionChange = (position: string) => {
    onChange({
      ...design,
      position
    });
  };
  
  // Handle color scheme preset selection
  const handleColorSchemeSelect = (preset: typeof colorPresets[0]) => {
    onChange({
      ...design,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor
    });
  };
  
  // Validate design settings
  useEffect(() => {
    const isValid = !!design.primaryColor && !!design.position;
    onValidChange(isValid);
  }, [design, onValidChange]);
  
  return (
    <div className="space-y-8">
      {/* Color Presets */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Choose a Color Scheme</h3>
        <p className="text-muted-foreground">
          Select a color scheme that matches your brand identity
        </p>
        <ColorSchemePresets onSelect={handleColorSchemeSelect} />
      </div>
      
      {/* Primary Color */}
      <FieldWithHelp
        label="Primary Color"
        helpText="The main color for your widget buttons and header"
        id="primary-color"
      >
        <div className="flex items-center gap-2">
          <input
            type="color"
            id="primary-color"
            value={design.primaryColor}
            onChange={(e) => handleColorChange(e.target.value, 'primaryColor')}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={design.primaryColor}
            onChange={(e) => handleColorChange(e.target.value, 'primaryColor')}
            className="flex-1 p-2 border rounded-md bg-background"
          />
        </div>
      </FieldWithHelp>
      
      {/* Theme Selection */}
      <FieldWithHelp
        label="Theme"
        helpText="Choose between light and dark mode for your widget"
        id="theme"
      >
        <Select 
          value={design.theme} 
          onValueChange={(value) => onChange({...design, theme: value})}
        >
          <SelectTrigger id="theme">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            {themeOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldWithHelp>
      
      {/* Position */}
      <div className="space-y-2">
        <h3 className="text-base font-medium">Widget Position</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Choose where the widget appears on your website
        </p>
        <div className="grid grid-cols-2 gap-3">
          {positionOptions.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handlePositionChange(option.value)}
                className={`flex items-center justify-center gap-2 p-3 border rounded-md ${
                  design.position === option.value 
                    ? 'bg-primary text-white' 
                    : 'bg-background hover:bg-muted/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Design Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mt-6">
        <div className="flex items-start gap-3">
          <Palette className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-300">Design Tips</h4>
            <ul className="text-sm text-blue-600 dark:text-blue-400 mt-1 space-y-1 list-disc pl-4">
              <li>Use colors that match your brand identity</li>
              <li>Position the widget where it won't interfere with important content</li>
              <li>Choose a theme that complements your website's design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
