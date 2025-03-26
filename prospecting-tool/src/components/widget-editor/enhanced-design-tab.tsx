import { useState } from "react";
import { EnhancedWidgetDesignConfig, GradientConfig, ShadowConfig } from "../../types/widget/enhanced-config.types";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { 
  CornerDownLeft, 
  CornerDownRight, 
  CornerUpLeft, 
  CornerUpRight,
  Upload,
  Image,
  Video,
  Palette,
  Sliders,
  Circle,
  Square,
  Sparkles,
  Zap,
  Clock,
  X
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import React from "react";

interface EnhancedDesignTabProps {
  design: EnhancedWidgetDesignConfig;
  onChange: (design: EnhancedWidgetDesignConfig) => void;
}

export function EnhancedDesignTab({ design, onChange }: EnhancedDesignTabProps) {
  const [activeTab, setActiveTab] = useState("appearance");
  const [gradientColorCount, setGradientColorCount] = useState(design.colors.gradient?.colors.length || 2);
  
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
    { value: "custom", label: "Custom" },
  ];
  
  // Animation type options
  const animationTypeOptions = [
    { value: "slide-up", label: "Slide Up" },
    { value: "slide-down", label: "Slide Down" },
    { value: "slide-left", label: "Slide Left" },
    { value: "slide-right", label: "Slide Right" },
    { value: "fade", label: "Fade" },
    { value: "scale", label: "Scale" },
    { value: "none", label: "None" },
  ];
  
  // Animation easing options
  const animationEasingOptions = [
    { value: "ease", label: "Ease" },
    { value: "ease-in", label: "Ease In" },
    { value: "ease-out", label: "Ease Out" },
    { value: "ease-in-out", label: "Ease In Out" },
    { value: "linear", label: "Linear" },
  ];
  
  // Font options
  const fontOptions = [
    { value: "Inter", label: "Inter" },
    { value: "Roboto", label: "Roboto" },
    { value: "Poppins", label: "Poppins" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", label: "System Default" },
  ];
  
  // Shadow options
  const shadowOptions = [
    { value: "none", label: "None" },
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
    { value: "xl", label: "Extra Large" },
    { value: "custom", label: "Custom" },
  ];
  
  // Gradient type options
  const gradientTypeOptions = [
    { value: "linear", label: "Linear" },
    { value: "radial", label: "Radial" },
  ];
  
  // Launcher shape options
  const launcherShapeOptions = [
    { value: "circle", label: "Circle", icon: Circle },
    { value: "rounded-square", label: "Rounded Square", icon: Square },
  ];
  
  // Handle color change
  const handleColorChange = (color: string, type: 'primary' | 'secondary' | 'text' | 'background' | 'accent') => {
    onChange({
      ...design,
      colors: {
        ...design.colors,
        [type]: color
      }
    });
  };
  
  // Handle gradient color change
  const handleGradientColorChange = (color: string, index: number) => {
    const updatedColors = [...(design.colors.gradient?.colors || [])];
    updatedColors[index] = color;
    
    onChange({
      ...design,
      colors: {
        ...design.colors,
        gradient: {
          ...(design.colors.gradient || { type: 'linear', direction: '135deg', colors: [] }),
          colors: updatedColors
        }
      }
    });
  };
  
  // Handle gradient type change
  const handleGradientTypeChange = (type: 'linear' | 'radial') => {
    onChange({
      ...design,
      colors: {
        ...design.colors,
        gradient: {
          ...(design.colors.gradient || { type: 'linear', direction: '135deg', colors: [] }),
          type
        }
      }
    });
  };
  
  // Handle gradient direction change
  const handleGradientDirectionChange = (direction: string) => {
    onChange({
      ...design,
      colors: {
        ...design.colors,
        gradient: {
          ...(design.colors.gradient || { type: 'linear', direction: '135deg', colors: [] }),
          direction
        }
      }
    });
  };
  
  // Handle position change
  const handlePositionChange = (position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left') => {
    onChange({
      ...design,
      position
    });
  };
  
  // Handle border radius change
  const handleBorderRadiusChange = (value: number[]) => {
    onChange({
      ...design,
      borderRadius: value[0]
    });
  };
  
  // Handle launcher size change
  const handleLauncherSizeChange = (value: number[]) => {
    onChange({
      ...design,
      launcher: {
        ...design.launcher,
        size: value[0]
      }
    });
  };
  
  // Handle launcher shape change
  const handleLauncherShapeChange = (shape: 'circle' | 'rounded-square') => {
    onChange({
      ...design,
      launcher: {
        ...design.launcher,
        shape
      }
    });
  };
  
  // Handle launcher gradient toggle
  const handleLauncherGradientToggle = (useGradient: boolean) => {
    onChange({
      ...design,
      launcher: {
        ...design.launcher,
        useGradient
      }
    });
  };
  
  // Handle launcher pulse animation toggle
  const handleLauncherPulseToggle = (pulseAnimation: boolean) => {
    onChange({
      ...design,
      launcher: {
        ...design.launcher,
        pulseAnimation
      }
    });
  };
  
  // Handle animation type change
  const handleAnimationTypeChange = (type: 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'fade' | 'scale' | 'none') => {
    onChange({
      ...design,
      animation: {
        ...design.animation,
        type
      }
    });
  };
  
  // Handle animation duration change
  const handleAnimationDurationChange = (value: number[]) => {
    onChange({
      ...design,
      animation: {
        ...design.animation,
        duration: value[0]
      }
    });
  };
  
  // Handle animation easing change
  const handleAnimationEasingChange = (easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear') => {
    onChange({
      ...design,
      animation: {
        ...design.animation,
        easing
      }
    });
  };
  
  // Handle shadow type change
  const handleShadowTypeChange = (type: string) => {
    if (type === 'custom') {
      onChange({
        ...design,
        shadow: {
          type: 'custom',
          x: 0,
          y: 4,
          blur: 12,
          spread: 0,
          color: 'rgba(0, 0, 0, 0.2)'
        }
      });
    } else {
      onChange({
        ...design,
        shadow: type
      });
    }
  };
  
  // Handle custom shadow change
  const handleCustomShadowChange = (field: keyof ShadowConfig, value: number | string) => {
    if (typeof design.shadow === 'object') {
      onChange({
        ...design,
        shadow: {
          ...design.shadow,
          [field]: value
        }
      });
    }
  };
  
  // Handle media upload
  const handleMediaUpload = (type: 'image' | 'video') => {
    const placeholderUrl = type === 'image' 
      ? 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=300'
      : 'https://example.com/sample-video.mp4';
    
    onChange({
      ...design,
      media: {
        type,
        url: placeholderUrl
      }
    });
  };
  
  // Handle media removal
  const handleRemoveMedia = () => {
    const { media, ...rest } = design;
    onChange({
      ...rest,
      media: undefined
    });
  };
  
  // Update gradient color count
  const updateGradientColorCount = (count: number) => {
    setGradientColorCount(count);
    
    const currentColors = design.colors.gradient?.colors || [];
    let newColors = [...currentColors];
    
    if (count > currentColors.length) {
      for (let i = currentColors.length; i < count; i++) {
        newColors.push(design.colors.primary);
      }
    } else if (count < currentColors.length) {
      newColors = newColors.slice(0, count);
    }
    
    onChange({
      ...design,
      colors: {
        ...design.colors,
        gradient: {
          ...(design.colors.gradient || { type: 'linear', direction: '135deg', colors: [] }),
          colors: newColors
        }
      }
    });
  };
  
  // Render gradient color inputs
  const renderGradientColorInputs = () => {
    const colors = design.colors.gradient?.colors || [];
    
    return (
      <div className="space-y-3">
        {Array.from({ length: gradientColorCount }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="color"
              value={colors[index] || design.colors.primary}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleGradientColorChange(e.target.value, index)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={colors[index] || design.colors.primary}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleGradientColorChange(e.target.value, index)}
              className="flex-1 p-2 border rounded-md bg-background"
            />
          </div>
        ))}
      </div>
    );
  };
  
  // Render gradient preview
  const renderGradientPreview = () => {
    const gradient = design.colors.gradient;
    if (!gradient) return null;
    
    const gradientStyle = gradient.type === 'linear'
      ? `linear-gradient(${gradient.direction || '135deg'}, ${gradient.colors.join(', ')})`
      : `radial-gradient(circle, ${gradient.colors.join(', ')})`;
    
    return (
      <div 
        className="w-full h-20 rounded-md mt-2 mb-4"
        style={{ background: gradientStyle }}
      />
    );
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="launcher">
            <Circle className="h-4 w-4 mr-2" />
            Launcher
          </TabsTrigger>
          <TabsTrigger value="animation">
            <Sparkles className="h-4 w-4 mr-2" />
            Animation
          </TabsTrigger>
          <TabsTrigger value="media">
            <Image className="h-4 w-4 mr-2" />
            Media
          </TabsTrigger>
        </TabsList>
        
        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select 
              value={design.theme} 
              onValueChange={(value: 'light' | 'dark' | 'custom') => onChange({...design, theme: value})}
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
          </div>
          
          {/* Colors Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Colors</h3>
              </div>
            </div>
            
            {/* Main Colors */}
            <div className="grid grid-cols-2 gap-4">
              {/* Primary Color */}
              <div>
                <Label htmlFor="primary-color">Primary</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    id="primary-color"
                    value={design.colors.primary}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange(e.target.value, 'primary')}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={design.colors.primary}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange(e.target.value, 'primary')}
                    className="flex-1 p-2 border rounded-md bg-background"
                  />
                </div>
              </div>
              
              {/* Secondary Color */}
              <div>
                <Label htmlFor="secondary-color">Secondary</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    id="secondary-color"
                    value={design.colors.secondary}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange(e.target.value, 'secondary')}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={design.colors.secondary}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange(e.target.value, 'secondary')}
                    className="flex-1 p-2 border rounded-md bg-background"
                  />
                </div>
              </div>
            </div>
            
            {/* Advanced Colors - Collapsible */}
            <div className="mt-4 border rounded-md p-3">
              <button 
                type="button"
                onClick={() => {
                  const advancedColors = document.getElementById('advanced-colors');
                  if (advancedColors) {
                    advancedColors.classList.toggle('hidden');
                  }
                }}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-sm font-medium">Advanced Colors</span>
                <span className="text-xs text-muted-foreground">Click to expand</span>
              </button>
              
              <div id="advanced-colors" className="hidden mt-3 space-y-3">
                {/* Text Color */}
                <div className="space-y-1">
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="text-color"
                      value={design.colors.text}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange(e.target.value, 'text')}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={design.colors.text}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange(e.target.value, 'text')}
                      className="flex-1 p-2 border rounded-md bg-background"
                    />
                  </div>
                </div>
                
                {/* Background Color */}
                <div className="space-y-1">
                  <Label htmlFor="background-color">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="background-color"
                      value={design.colors.background}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange(e.target.value, 'background')}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={design.colors.background}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange(e.target.value, 'background')}
                      className="flex-1 p-2 border rounded-md bg-background"
                    />
                  </div>
                </div>
                
                {/* Accent Color */}
                <div className="space-y-1">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="accent-color"
                      value={design.colors.accent || '#ff5733'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange(e.target.value, 'accent')}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={design.colors.accent || '#ff5733'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange(e.target.value, 'accent')}
                      className="flex-1 p-2 border rounded-md bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Gradient Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Gradient</h3>
            </div>
            
            {renderGradientPreview()}
            
            {/* Gradient Type */}
            <div className="space-y-2">
              <Label htmlFor="gradient-type">Gradient Type</Label>
              <Select 
                value={design.colors.gradient?.type || 'linear'} 
                onValueChange={(value: 'linear' | 'radial') => handleGradientTypeChange(value)}
              >
                <SelectTrigger id="gradient-type">
                  <SelectValue placeholder="Select gradient type" />
                </SelectTrigger>
                <SelectContent>
                  {gradientTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Gradient Direction (for linear gradients) */}
            {design.colors.gradient?.type === 'linear' && (
              <div className="space-y-2">
                <Label htmlFor="gradient-direction">Gradient Direction</Label>
                <Input
                  id="gradient-direction"
                  value={design.colors.gradient?.direction || '135deg'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleGradientDirectionChange(e.target.value)}
                  placeholder="e.g., 135deg"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a value like "135deg", "to right", or "to bottom right"
                </p>
              </div>
            )}
            
            {/* Gradient Color Count */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="gradient-color-count">Color Stops</Label>
                <span className="text-sm text-muted-foreground">{gradientColorCount}</span>
              </div>
              <Slider
                id="gradient-color-count"
                min={2}
                max={5}
                step={1}
                value={[gradientColorCount]}
                onValueChange={(value: number[]) => updateGradientColorCount(value[0])}
              />
            </div>
            
            {/* Gradient Colors */}
            <div className="space-y-2">
              <Label>Gradient Colors</Label>
              {renderGradientColorInputs()}
            </div>
          </div>
          
          {/* Font Family */}
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="font-family">Font Family</Label>
            <Select 
              value={design.fontFamily} 
              onValueChange={(value: string) => onChange({...design, fontFamily: value})}
            >
              <SelectTrigger id="font-family">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        {/* Launcher Tab */}
        <TabsContent value="launcher" className="space-y-6">
          {/* Position */}
          <div className="space-y-2">
            <Label>Position</Label>
            <div className="grid grid-cols-2 gap-2">
              {positionOptions.map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePositionChange(option.value as any)}
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
          
          {/* Launcher Size */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="launcher-size">Launcher Size</Label>
              <span className="text-sm text-muted-foreground">{design.launcher.size}px</span>
            </div>
            <Slider
              id="launcher-size"
              min={40}
              max={80}
              step={1}
              value={[design.launcher.size]}
              onValueChange={handleLauncherSizeChange}
            />
          </div>
          
          {/* Launcher Shape */}
          <div className="space-y-2">
            <Label>Launcher Shape</Label>
            <div className="grid grid-cols-2 gap-2">
              {launcherShapeOptions.map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleLauncherShapeChange(option.value as any)}
                    className={`flex items-center justify-center gap-2 p-3 border rounded-md ${
                      design.launcher.shape === option.value 
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
          
          {/* Use Gradient */}
          <div className="flex items-center justify-between space-y-0 pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="use-gradient">Use Gradient</Label>
              <p className="text-sm text-muted-foreground">
                Apply gradient colors to the launcher button
              </p>
            </div>
            <Switch
              id="use-gradient"
              checked={design.launcher.useGradient}
              onCheckedChange={handleLauncherGradientToggle}
            />
          </div>
          
          {/* Pulse Animation */}
          <div className="flex items-center justify-between space-y-0 pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="pulse-animation">Pulse Animation</Label>
              <p className="text-sm text-muted-foreground">
                Add a subtle pulse animation to draw attention
              </p>
            </div>
            <Switch
              id="pulse-animation"
              checked={design.launcher.pulseAnimation}
              onCheckedChange={handleLauncherPulseToggle}
            />
          </div>
          
          {/* Border Radius */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between">
              <Label htmlFor="border-radius">Border Radius</Label>
              <span className="text-sm text-muted-foreground">{design.borderRadius}px</span>
            </div>
            <Slider
              id="border-radius"
              min={0}
              max={24}
              step={1}
              value={[design.borderRadius]}
              onValueChange={handleBorderRadiusChange}
            />
          </div>
          
          {/* Shadow */}
          <div className="space-y-2 pt-2">
            <Label htmlFor="shadow">Shadow</Label>
            <Select 
              value={typeof design.shadow === 'object' ? design.shadow.type : design.shadow} 
              onValueChange={handleShadowTypeChange}
            >
              <SelectTrigger id="shadow">
                <SelectValue placeholder="Select shadow" />
              </SelectTrigger>
              <SelectContent>
                {shadowOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Custom Shadow Options */}
          {typeof design.shadow === 'object' && design.shadow.type === 'custom' && (
            <div className="space-y-4 pt-2 border-t">
              <h4 className="text-sm font-medium">Custom Shadow Settings</h4>
              
              {/* X Offset */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="shadow-x">X Offset</Label>
                  <span className="text-sm text-muted-foreground">{design.shadow.x}px</span>
                </div>
                <Slider
                  id="shadow-x"
                  min={-20}
                  max={20}
                  step={1}
                  value={[design.shadow.x || 0]}
                  onValueChange={(value: number[]) => handleCustomShadowChange('x', value[0])}
                />
              </div>
              
              {/* Y Offset */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="shadow-y">Y Offset</Label>
                  <span className="text-sm text-muted-foreground">{design.shadow.y}px</span>
                </div>
                <Slider
                  id="shadow-y"
                  min={-20}
                  max={20}
                  step={1}
                  value={[design.shadow.y || 0]}
                  onValueChange={(value: number[]) => handleCustomShadowChange('y', value[0])}
                />
              </div>
              
              {/* Blur */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="shadow-blur">Blur</Label>
                  <span className="text-sm text-muted-foreground">{design.shadow.blur}px</span>
                </div>
                <Slider
                  id="shadow-blur"
                  min={0}
                  max={50}
                  step={1}
                  value={[design.shadow.blur || 0]}
                  onValueChange={(value: number[]) => handleCustomShadowChange('blur', value[0])}
                />
              </div>
              
              {/* Spread */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="shadow-spread">Spread</Label>
                  <span className="text-sm text-muted-foreground">{design.shadow.spread}px</span>
                </div>
                <Slider
                  id="shadow-spread"
                  min={-20}
                  max={20}
                  step={1}
                  value={[design.shadow.spread || 0]}
                  onValueChange={(value: number[]) => handleCustomShadowChange('spread', value[0])}
                />
              </div>
              
              {/* Shadow Color */}
              <div className="space-y-2">
                <Label htmlFor="shadow-color">Shadow Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="shadow-color"
                    value={design.shadow.color?.startsWith('rgba') ? '#000000' : design.shadow.color || '#000000'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCustomShadowChange('color', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={design.shadow.color || '#000000'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCustomShadowChange('color', e.target.value)}
                    className="flex-1 p-2 border rounded-md bg-background"
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Animation Tab */}
        <TabsContent value="animation" className="space-y-6">
          {/* Animation Type */}
          <div className="space-y-2">
            <Label htmlFor="animation-type">Animation Type</Label>
            <Select 
              value={design.animation.type} 
              onValueChange={(value: 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'fade' | 'scale' | 'none') => handleAnimationTypeChange(value)}
            >
              <SelectTrigger id="animation-type">
                <SelectValue placeholder="Select animation type" />
              </SelectTrigger>
              <SelectContent>
                {animationTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Animation Duration */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="animation-duration">Animation Duration</Label>
              <span className="text-sm text-muted-foreground">{design.animation.duration}ms</span>
            </div>
            <Slider
              id="animation-duration"
              min={100}
              max={1000}
              step={50}
              value={[design.animation.duration]}
              onValueChange={handleAnimationDurationChange}
            />
          </div>
          
          {/* Animation Easing */}
          <div className="space-y-2">
            <Label htmlFor="animation-easing">Animation Easing</Label>
            <Select 
              value={design.animation.easing} 
              onValueChange={(value: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear') => handleAnimationEasingChange(value)}
            >
              <SelectTrigger id="animation-easing">
                <SelectValue placeholder="Select easing" />
              </SelectTrigger>
              <SelectContent>
                {animationEasingOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          {/* Media Type */}
          <div className="space-y-2">
            <Label>Media Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleMediaUpload('image')}
                className="flex items-center justify-center gap-2 p-3 border rounded-md bg-background hover:bg-muted/50"
              >
                <Image className="h-5 w-5" />
                <span>Image</span>
              </button>
              <button
                type="button"
                onClick={() => handleMediaUpload('video')}
                className="flex items-center justify-center gap-2 p-3 border rounded-md bg-background hover:bg-muted/50"
              >
                <Video className="h-5 w-5" />
                <span>Video</span>
              </button>
            </div>
          </div>
          
          {/* Media Preview */}
          {design.media && (
            <div className="space-y-2">
              <Label>Media Preview</Label>
              <div className="relative">
                {design.media.type === 'image' ? (
                  <img
                    src={design.media.url}
                    alt="Media Preview"
                    className="w-full h-auto rounded-md"
                  />
                ) : (
                  <video
                    src={design.media.url}
                    controls
                    className="w-full h-auto rounded-md"
                  />
                )}
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
