import { ReactNode } from "react";
import { Layout, Settings, FileText, Code, Monitor, Smartphone, Palette, Box, Type, Image } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define the types for our tabs
type PrimaryTabType = 'design' | 'behavior' | 'content' | 'integration';
type SecondaryTabType = 'appearance' | 'layout' | 'typography' | 'media' | string;

interface EnhancedTabsNavigationProps {
  primaryTab: PrimaryTabType;
  secondaryTab: SecondaryTabType;
  onPrimaryTabChange: (value: PrimaryTabType) => void;
  onSecondaryTabChange: (value: SecondaryTabType) => void;
  secondaryTabs: Record<PrimaryTabType, SecondaryTabType[]>;
}

export function EnhancedTabsNavigation({
  primaryTab,
  secondaryTab,
  onPrimaryTabChange,
  onSecondaryTabChange,
  secondaryTabs,
}: EnhancedTabsNavigationProps) {
  // Icons for primary tabs
  const primaryTabIcons: Record<PrimaryTabType, ReactNode> = {
    design: <Layout className="h-4 w-4" />,
    behavior: <Settings className="h-4 w-4" />,
    content: <FileText className="h-4 w-4" />,
    integration: <Code className="h-4 w-4" />,
  };

  // Icons for secondary tabs
  const secondaryTabIcons: Partial<Record<SecondaryTabType, ReactNode>> = {
    appearance: <Palette className="h-4 w-4" />,
    layout: <Box className="h-4 w-4" />,
    typography: <Type className="h-4 w-4" />,
    media: <Image className="h-4 w-4" />,
    // Add more icons for other secondary tabs as needed
  };

  // Helper text for tabs
  const tabHelperText: Partial<Record<PrimaryTabType | SecondaryTabType, string>> = {
    design: "Customize the look and feel of your widget",
    behavior: "Control when and how your widget appears",
    content: "Edit the text and messaging of your widget",
    integration: "Connect your widget to external services",
    appearance: "Set colors, theme, and visual style",
    layout: "Control positioning and spacing",
    typography: "Customize fonts and text styling",
    media: "Add images or videos to your widget",
    // Add more helper text for other tabs as needed
  };

  return (
    <div className="space-y-6">
      {/* Primary navigation - more prominent */}
      <Tabs value={primaryTab} onValueChange={(value) => onPrimaryTabChange(value as PrimaryTabType)}>
        <TooltipProvider>
          <TabsList className="w-full grid grid-cols-4 p-1 bg-muted/30 rounded-lg">
            {(Object.keys(primaryTabIcons) as PrimaryTabType[]).map((tab) => (
              <Tooltip key={tab}>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value={tab}
                    className={`flex items-center gap-2 py-3 ${
                      primaryTab === tab ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {primaryTabIcons[tab as PrimaryTabType]}
                    <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tabHelperText[tab]}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TabsList>
        </TooltipProvider>
      </Tabs>

      <Separator className="opacity-30" />

      {/* Secondary navigation - visually subordinate */}
      <Tabs value={secondaryTab} onValueChange={(value) => onSecondaryTabChange(value as SecondaryTabType)}>
        <TooltipProvider>
          <TabsList className="w-full border-b border-muted overflow-x-auto">
            {secondaryTabs[primaryTab]?.map((tab) => (
              <Tooltip key={tab}>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value={tab}
                    className={`pb-2 text-sm font-normal flex items-center gap-1 ${
                      secondaryTab === tab ? "border-b-2 border-primary" : ""
                    }`}
                  >
                    {secondaryTabIcons[tab] && secondaryTabIcons[tab]}
                    <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tabHelperText[tab]}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TabsList>
        </TooltipProvider>
      </Tabs>
    </div>
  );
}
