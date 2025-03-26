import { useState } from "react";
import { Widget } from "./widget-types";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CornerDownLeft, 
  CornerDownRight, 
  CornerUpLeft, 
  CornerUpRight,
  Upload,
  Image,
  Video
} from "lucide-react";

interface DesignTabProps {
  design: Widget['design'];
  onChange: (design: Widget['design']) => void;
}

export function DesignTab({ design, onChange }: DesignTabProps) {
  const [activeTab, setActiveTab] = useState("appearance");
  
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
  
  // Animation options
  const animationOptions = [
    { value: "slide-up", label: "Slide Up" },
    { value: "slide-down", label: "Slide Down" },
    { value: "slide-left", label: "Slide Left" },
    { value: "slide-right", label: "Slide Right" },
    { value: "fade", label: "Fade" },
    { value: "scale", label: "Scale" },
    { value: "none", label: "None" },
  ];
  
  // Font options
  const fontOptions = [
    { value: "Inter", label: "Inter" },
    { value: "Roboto", label: "Roboto" },
    { value: "Poppins", label: "Poppins" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Open Sans", label: "Open Sans" },
  ];
  
  // Shadow options
  const shadowOptions = [
    { value: "none", label: "None" },
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
    { value: "xl", label: "Extra Large" },
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
  
  // Handle border radius change
  const handleBorderRadiusChange = (value: number[]) => {
    onChange({
      ...design,
      borderRadius: value[0]
    });
  };
  
  // Handle media upload
  const handleMediaUpload = (type: 'image' | 'video') => {
    // In a real implementation, this would open a file picker and upload the file
    // For now, we'll just set a placeholder URL
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
    onChange(rest);
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="space-y-4">
          {/* Theme Selection */}
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
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
          </div>
          
          {/* Primary Color */}
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primary Color</Label>
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
          </div>
          
          {/* Secondary Color */}
          <div className="space-y-2">
            <Label htmlFor="secondary-color">Secondary Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="secondary-color"
                value={design.secondaryColor}
                onChange={(e) => handleColorChange(e.target.value, 'secondaryColor')}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={design.secondaryColor}
                onChange={(e) => handleColorChange(e.target.value, 'secondaryColor')}
                className="flex-1 p-2 border rounded-md bg-background"
              />
            </div>
          </div>
          
          {/* Font Family */}
          <div className="space-y-2">
            <Label htmlFor="font-family">Font Family</Label>
            <Select 
              value={design.fontFamily} 
              onValueChange={(value) => onChange({...design, fontFamily: value})}
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
        
        <TabsContent value="layout" className="space-y-4">
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
          
          {/* Border Radius */}
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label htmlFor="shadow">Shadow</Label>
            <Select 
              value={design.shadow} 
              onValueChange={(value) => onChange({...design, shadow: value})}
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
          
          {/* Animation */}
          <div className="space-y-2">
            <Label htmlFor="animation">Animation</Label>
            <Select 
              value={design.animation} 
              onValueChange={(value) => onChange({...design, animation: value})}
            >
              <SelectTrigger id="animation">
                <SelectValue placeholder="Select animation" />
              </SelectTrigger>
              <SelectContent>
                {animationOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        <TabsContent value="media" className="space-y-4">
          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Host Media</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Add a photo or video of the person who will be conducting the demo
            </p>
            
            {design.media ? (
              <div className="border rounded-md p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {design.media.type === 'image' ? (
                      <Image className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Video className="h-5 w-5 text-blue-500" />
                    )}
                    <span className="text-sm font-medium">
                      {design.media.type === 'image' ? 'Image' : 'Video'} uploaded
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                
                {design.media.type === 'image' && (
                  <div className="relative aspect-square w-full max-w-[200px] mx-auto overflow-hidden rounded-md border">
                    <img 
                      src={design.media.url} 
                      alt="Host" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleMediaUpload('image')}
                  className="flex flex-col items-center justify-center gap-2 p-4 border rounded-md bg-background hover:bg-muted/50"
                >
                  <div className="rounded-full bg-blue-100 p-2">
                    <Image className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium">Upload Image</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleMediaUpload('video')}
                  className="flex flex-col items-center justify-center gap-2 p-4 border rounded-md bg-background hover:bg-muted/50"
                >
                  <div className="rounded-full bg-blue-100 p-2">
                    <Video className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium">Upload Video</span>
                </button>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              Recommended: Square image (1:1 ratio), minimum 300x300px
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
