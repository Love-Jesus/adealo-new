import { useState } from "react";
import { Widget } from "./widget-types";
import { WidgetPreview } from "./widget-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Smartphone, Tablet, Minimize2, Maximize2, Check, Eye, Code } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EnhancedPreviewProps {
  widget: Widget;
  previewDevice: 'desktop' | 'mobile' | 'tablet';
  previewState: 'initial' | 'expanded' | 'confirmation';
  setPreviewDevice: (device: 'desktop' | 'mobile' | 'tablet') => void;
  setPreviewState: (state: 'initial' | 'expanded' | 'confirmation') => void;
}

export function EnhancedPreview({
  widget,
  previewDevice,
  previewState,
  setPreviewDevice,
  setPreviewState,
}: EnhancedPreviewProps) {
  // State for view mode (visitor or developer)
  const [viewMode, setViewMode] = useState<'visitor' | 'developer'>('visitor');

  // Device options for the toggle
  const deviceOptions = [
    { value: 'desktop', label: 'Desktop', icon: Monitor },
    { value: 'tablet', label: 'Tablet', icon: Tablet },
    { value: 'mobile', label: 'Mobile', icon: Smartphone },
  ];

  // State options for the toggle
  const stateOptions = [
    { value: 'initial', label: 'Initial', icon: Minimize2 },
    { value: 'expanded', label: 'Expanded', icon: Maximize2 },
    { value: 'confirmation', label: 'Confirmation', icon: Check },
  ];

  return (
    <Card className="w-full sticky top-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Live Preview</CardTitle>
            <CardDescription>
              See how your widget will appear to visitors
            </CardDescription>
          </div>
          
          {/* View mode toggle */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="view-mode" className="text-sm">
              {viewMode === 'visitor' ? 'Visitor View' : 'Developer View'}
            </Label>
            <Switch
              id="view-mode"
              checked={viewMode === 'developer'}
              onCheckedChange={(checked) => setViewMode(checked ? 'developer' : 'visitor')}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Device toggle with more visual prominence */}
        <div className="flex justify-center p-2 bg-muted/30 rounded-t-lg border-x border-t">
          <Tabs value={previewDevice} onValueChange={(value) => setPreviewDevice(value as any)} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              {deviceOptions.map((device) => {
                const Icon = device.icon;
                return (
                  <TabsTrigger key={device.value} value={device.value} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{device.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
        
        {/* Preview container with enhanced styling */}
        <div 
          className={`
            relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 
            border rounded-b-lg overflow-hidden transition-all
            ${previewDevice === 'desktop' ? 'w-full h-[500px]' : 
              previewDevice === 'tablet' ? 'w-[600px] h-[800px] mx-auto' : 
              'w-[320px] h-[568px] mx-auto'}
          `}
        >
          {/* Mock website content */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-white dark:bg-gray-800 border-b flex items-center px-4">
            <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="ml-auto flex space-x-4">
              <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
          
          <div className="absolute top-20 left-8 right-8">
            <div className="w-3/4 h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-600 rounded mb-6"></div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
            
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="w-4/5 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
          
          {/* Widget preview */}
          <WidgetPreview 
            widget={widget}
            state={previewState}
            device={previewDevice === 'tablet' ? 'desktop' : previewDevice}
          />
          
          {/* Developer overlay */}
          {viewMode === 'developer' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-background p-4 rounded-lg max-w-md w-full">
                <h3 className="font-medium mb-2">Developer View</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-mono">{widget.design.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Animation:</span>
                    <span className="font-mono">{widget.design.animation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trigger:</span>
                    <span className="font-mono">{widget.behavior.trigger}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delay:</span>
                    <span className="font-mono">{widget.behavior.delay}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mobile:</span>
                    <span className="font-mono">{widget.behavior.displayOnMobile ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* State toggle with visual indicators */}
        <Tabs value={previewState} onValueChange={(value) => setPreviewState(value as any)} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            {stateOptions.map((state) => {
              const Icon = state.icon;
              return (
                <TabsTrigger key={state.value} value={state.value} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{state.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
        
        {/* Help text */}
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Toggle between states to preview different widget interactions
        </div>
      </CardContent>
    </Card>
  );
}
