import { useState } from "react";
import { Calendar, MessageSquare, Check, Info, Layers } from "lucide-react";
import { WidgetType } from "./widget-types";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define widget type options
const widgetTypes = [
  {
    value: 'MultiWidget' as WidgetType,
    label: 'Multi-Purpose Widget',
    description: 'All-in-one widget with booking and chat capabilities',
    icon: Layers,
    preview: '/widget-previews/multi-widget.png', // This would be a real image path in production
    primaryColor: '#6e8efb',
    features: [
      'Calendar integration',
      'Live chat interface',
      'AI-powered responses',
      'Lead capture form',
      'Team assignment',
      'File sharing'
    ]
  }
];

// Placeholder image for preview (in a real implementation, you would use actual images)
const placeholderImage = (color: string) => `
  <svg width="100%" height="100%" viewBox="0 0 400 225" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="225" fill="#f8f9fa"/>
    <rect x="280" y="140" width="100" height="60" rx="8" fill="${color}"/>
    <rect x="20" y="20" width="360" height="30" rx="4" fill="#e9ecef"/>
    <rect x="20" y="70" width="240" height="15" rx="4" fill="#e9ecef"/>
    <rect x="20" y="95" width="200" height="15" rx="4" fill="#e9ecef"/>
    <rect x="20" y="120" width="180" height="15" rx="4" fill="#e9ecef"/>
    <text x="330" y="175" font-family="Arial" font-size="12" fill="white" text-anchor="middle">Button</text>
  </svg>
`;

interface VisualWidgetTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedType: WidgetType;
  onTypeSelect: (type: WidgetType) => void;
  onContinue: () => void;
}

export function VisualWidgetTypeSelector({
  open,
  onOpenChange,
  selectedType,
  onTypeSelect,
  onContinue
}: VisualWidgetTypeSelectorProps) {
  // State for hovering over features info
  const [hoveredType, setHoveredType] = useState<WidgetType | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Select Widget Type</DialogTitle>
          <DialogDescription>
            Choose the type of widget you want to create for your website
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {widgetTypes.map(type => (
            <div 
              key={type.value}
              className={`
                relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all
                ${selectedType === type.value ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}
              `}
              onClick={() => onTypeSelect(type.value)}
            >
              {/* Preview thumbnail */}
              <div className="aspect-video bg-muted/30 relative">
                {/* In a real implementation, you would use an actual image */}
                <div dangerouslySetInnerHTML={{ __html: placeholderImage(type.primaryColor) }} />
                
                {selectedType === type.value && (
                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              {/* Type info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <type.icon className="h-5 w-5 text-primary" style={{ color: type.primaryColor }} />
                    <h3 className="font-medium">{type.label}</h3>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onMouseEnter={() => setHoveredType(type.value)}
                          onMouseLeave={() => setHoveredType(null)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="w-64 p-4">
                        <h4 className="font-medium mb-2">Features:</h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {type.features.map((feature, index) => (
                            <li key={index} className="text-sm">{feature}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            You can customize all aspects of your widget after selection
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={onContinue} 
              disabled={!selectedType}
            >
              Continue
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
