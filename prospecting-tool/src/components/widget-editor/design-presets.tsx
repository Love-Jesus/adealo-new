import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Palette, Type } from "lucide-react";

// Define color scheme presets
export const colorPresets = [
  {
    name: "Blue Modern",
    primaryColor: "#3B82F6",
    secondaryColor: "#FFFFFF",
    description: "Professional and trustworthy"
  },
  {
    name: "Green Nature",
    primaryColor: "#10B981",
    secondaryColor: "#FFFFFF",
    description: "Fresh and eco-friendly"
  },
  {
    name: "Purple Creative",
    primaryColor: "#8B5CF6",
    secondaryColor: "#FFFFFF",
    description: "Creative and innovative"
  },
  {
    name: "Red Energy",
    primaryColor: "#EF4444",
    secondaryColor: "#FFFFFF",
    description: "Bold and energetic"
  },
  {
    name: "Orange Friendly",
    primaryColor: "#F97316",
    secondaryColor: "#FFFFFF",
    description: "Warm and approachable"
  },
  {
    name: "Dark Professional",
    primaryColor: "#1F2937",
    secondaryColor: "#FFFFFF",
    description: "Elegant and sophisticated"
  }
];

// Define font pairings
export const fontPairings = [
  {
    name: "Modern Sans",
    heading: "Inter",
    body: "Inter",
    description: "Clean and professional"
  },
  {
    name: "Classic Serif",
    heading: "Merriweather",
    body: "Georgia",
    description: "Traditional and authoritative"
  },
  {
    name: "Friendly Mix",
    heading: "Poppins",
    body: "Open Sans",
    description: "Approachable and readable"
  },
  {
    name: "Tech Forward",
    heading: "Roboto",
    body: "Roboto Mono",
    description: "Modern and technical"
  },
  {
    name: "Creative Contrast",
    heading: "Montserrat",
    body: "Lora",
    description: "Stylish with good contrast"
  }
];

interface ColorSchemePresetsProps {
  onSelect: (preset: typeof colorPresets[0]) => void;
}

export function ColorSchemePresets({ onSelect }: ColorSchemePresetsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-primary" />
        <Label className="font-medium">Color Presets</Label>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {colorPresets.map(preset => (
          <TooltipProvider key={preset.name}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full border overflow-hidden relative hover:ring-2 ring-offset-2 ring-primary/50 transition-all"
                  onClick={() => onSelect(preset)}
                  aria-label={preset.name}
                >
                  <div 
                    className="absolute inset-0" 
                    style={{ backgroundColor: preset.primaryColor }}
                  />
                  <div 
                    className="absolute bottom-0 right-0 w-1/2 h-1/2 border-t border-l" 
                    style={{ backgroundColor: preset.secondaryColor }}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="text-center">
                  <p className="font-medium">{preset.name}</p>
                  <p className="text-xs text-muted-foreground">{preset.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}

interface FontPairingPresetsProps {
  onSelect: (pair: typeof fontPairings[0]) => void;
}

export function FontPairingPresets({ onSelect }: FontPairingPresetsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-primary" />
        <Label className="font-medium">Font Pairings</Label>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {fontPairings.map(pair => (
          <button
            key={pair.name}
            type="button"
            className="p-2 border rounded-md text-left hover:bg-muted/50 transition-colors"
            onClick={() => onSelect(pair)}
          >
            <div className="font-medium" style={{ fontFamily: pair.heading }}>
              {pair.name}
            </div>
            <div className="text-xs text-muted-foreground" style={{ fontFamily: pair.body }}>
              {pair.heading} + {pair.body}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Combined component for all design presets
interface DesignPresetsProps {
  onSelectColorScheme: (preset: typeof colorPresets[0]) => void;
  onSelectFontPairing: (pair: typeof fontPairings[0]) => void;
}

export function DesignPresets({ onSelectColorScheme, onSelectFontPairing }: DesignPresetsProps) {
  return (
    <div className="space-y-6 p-4 bg-muted/20 rounded-lg border">
      <h3 className="font-medium">Quick Design Presets</h3>
      
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Color Schemes</span>
          </TabsTrigger>
          <TabsTrigger value="fonts" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span>Font Pairings</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="pt-4">
          <TabsContent value="colors">
            <ColorSchemePresets onSelect={onSelectColorScheme} />
          </TabsContent>
          
          <TabsContent value="fonts">
            <FontPairingPresets onSelect={onSelectFontPairing} />
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="text-xs text-muted-foreground text-center">
        Click any preset to quickly apply it to your widget
      </div>
    </div>
  );
}
