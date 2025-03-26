import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WidgetEmbedCode } from "@/components/widget-embed-code";
import { WidgetEmbedExample } from "@/components/widget-embed-example";
import { Button } from "@/components/ui/button";
import { Code } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WidgetEmbedDialogProps {
  widgetId: string;
  widgetName: string;
  primaryColor?: string;
  secondaryColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  title?: string;
  description?: string;
  ctaText?: string;
  calendlyUrl?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WidgetEmbedDialog({
  widgetId,
  widgetName,
  primaryColor = '#3A36DB',
  secondaryColor = '#FFFFFF',
  position = 'bottom-right',
  title = 'Book a Demo with Our Team',
  description = 'Learn how our solution can help your business grow',
  ctaText = 'Schedule a Meeting',
  calendlyUrl = 'https://calendly.com/your-calendly-link',
  trigger,
  open,
  onOpenChange,
}: WidgetEmbedDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("firebase");
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Code className="h-4 w-4 mr-2" />
            Get Embed Code
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Widget Embed Code</DialogTitle>
          <DialogDescription>
            Get the code to embed this widget on your website
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="firebase">Firebase Function</TabsTrigger>
              <TabsTrigger value="example">Example Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="firebase" className="mt-4">
              <WidgetEmbedCode 
                widgetId={widgetId} 
                widgetName={widgetName}
                onError={() => setActiveTab("example")}
              />
            </TabsContent>
            
            <TabsContent value="example" className="mt-4">
              <WidgetEmbedExample
                widgetId={widgetId}
                widgetName={widgetName}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                position={position as any}
                title={title}
                description={description}
                ctaText={ctaText}
                calendlyUrl={calendlyUrl}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
