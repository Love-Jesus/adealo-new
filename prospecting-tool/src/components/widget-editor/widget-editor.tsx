import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, Settings, Calendar, Code, MessageSquare, CalendarClock } from "lucide-react";
import { DesignTab } from "@/components/widget-editor/design-tab";
import { BehaviorTab } from "@/components/widget-editor/behavior-tab";
import { ContentTab } from "@/components/widget-editor/content-tab";
import { IntegrationTab } from "@/components/widget-editor/integration-tab";
import { WidgetPreview } from "@/components/widget-editor/widget-preview";
import { Widget, defaultWidget, defaultChatWidget, WidgetType } from "@/components/widget-editor/widget-types";

interface WidgetEditorProps {
  widget?: Widget;
  onSave: (widget: Widget) => void;
  onCancel: () => void;
}

export function WidgetEditor({ widget, onSave, onCancel }: WidgetEditorProps) {
  const [currentWidget, setCurrentWidget] = useState<Widget>(widget || defaultWidget);
  const [widgetType, setWidgetType] = useState<WidgetType>(widget?.type as WidgetType || 'Book Demo');
  const [activeTab, setActiveTab] = useState("design");
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewState, setPreviewState] = useState<'initial' | 'expanded' | 'confirmation'>('expanded');
  const [isValid, setIsValid] = useState(false);

  // Handle widget type change
  const handleWidgetTypeChange = (type: WidgetType) => {
    setWidgetType(type);
    
    // Reset widget to default template based on type
    if (type === 'Book Demo') {
      setCurrentWidget({
        ...defaultWidget,
        name: currentWidget.name, // Preserve the name
        id: currentWidget.id // Preserve the ID if it exists
      });
    } else if (type === 'Support Chat') {
      setCurrentWidget({
        ...defaultChatWidget,
        name: currentWidget.name, // Preserve the name
        id: currentWidget.id // Preserve the ID if it exists
      });
    }
  };

  // Validate widget data
  useEffect(() => {
    // Basic validation
    const designValid = currentWidget.design.primaryColor && currentWidget.design.position;
    const contentValid = currentWidget.content.title && currentWidget.content.ctaText;
    const behaviorValid = currentWidget.behavior.trigger !== undefined;
    
    // Different validation based on widget type
    let integrationValid = true;
    
    if (currentWidget.type === 'Book Demo') {
      integrationValid = Boolean(currentWidget.integration.calendlyUrl && 
                                currentWidget.integration.calendlyUrl.includes('calendly.com'));
    } else if (currentWidget.type === 'Support Chat') {
      // For chat widgets, we don't require Calendly URL
      integrationValid = true;
    }
    
    // Ensure we're passing a boolean to setIsValid
    setIsValid(Boolean(designValid && contentValid && behaviorValid && integrationValid));
  }, [currentWidget]);

  // Update widget design
  const handleDesignChange = (design: Widget['design']) => {
    setCurrentWidget(prev => ({
      ...prev,
      design: {
        ...prev.design,
        ...design
      }
    }));
  };

  // Update widget content
  const handleContentChange = (content: Widget['content']) => {
    setCurrentWidget(prev => ({
      ...prev,
      content: {
        ...prev.content,
        ...content
      }
    }));
  };

  // Update widget behavior
  const handleBehaviorChange = (behavior: Widget['behavior']) => {
    setCurrentWidget(prev => ({
      ...prev,
      behavior: {
        ...prev.behavior,
        ...behavior
      }
    }));
  };

  // Update widget integration
  const handleIntegrationChange = (integration: Widget['integration']) => {
    setCurrentWidget(prev => ({
      ...prev,
      integration: {
        ...prev.integration,
        ...integration
      }
    }));
  };

  // Handle save
  const handleSave = () => {
    // Add timestamps
    const now = new Date();
    const widgetToSave = {
      ...currentWidget,
      updatedAt: now,
      createdAt: currentWidget.createdAt || now,
      stats: currentWidget.stats || {
        views: 0,
        interactions: 0,
        leads: 0
      }
    };
    
    onSave(widgetToSave);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Configuration Panel */}
      <div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{widget ? 'Edit Widget' : 'Create New Widget'}</CardTitle>
            <CardDescription>
              {widget 
                ? `Editing "${widget.name}"`
                : 'Configure your new Book a Demo widget'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Widget Configuration */}
            <div className="space-y-6 mb-6">
              {/* Widget Name Input */}
              <div>
                <label htmlFor="widget-name" className="block text-sm font-medium mb-1">
                  Widget Name
                </label>
                <input
                  id="widget-name"
                  type="text"
                  value={currentWidget.name}
                  onChange={(e) => setCurrentWidget({...currentWidget, name: e.target.value})}
                  className="w-full p-2 border rounded-md bg-background"
                  placeholder="Enter widget name"
                />
              </div>
              
              {/* Widget Type Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Widget Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleWidgetTypeChange('Book Demo')}
                    className={`flex flex-col items-center justify-center p-3 border rounded-md transition-colors ${
                      widgetType === 'Book Demo' 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CalendarClock className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Book Demo</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Schedule meetings with Calendly
                    </span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleWidgetTypeChange('Support Chat')}
                    className={`flex flex-col items-center justify-center p-3 border rounded-md transition-colors ${
                      widgetType === 'Support Chat' 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MessageSquare className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Support Chat</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Live chat with your visitors
                    </span>
                  </button>
                </div>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="design" className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  <span>Design</span>
                </TabsTrigger>
                <TabsTrigger value="behavior" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Behavior</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Content</span>
                </TabsTrigger>
                <TabsTrigger value="integration" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span>Integration</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="design">
                <DesignTab 
                  design={currentWidget.design} 
                  onChange={handleDesignChange} 
                />
              </TabsContent>
              
              <TabsContent value="behavior">
                <BehaviorTab 
                  behavior={currentWidget.behavior} 
                  onChange={handleBehaviorChange} 
                />
              </TabsContent>
              
              <TabsContent value="content">
                <ContentTab 
                  content={currentWidget.content}
                  widgetType={widgetType}
                  onChange={handleContentChange} 
                />
              </TabsContent>
              
              <TabsContent value="integration">
                <IntegrationTab 
                  integration={currentWidget.integration}
                  widgetType={widgetType}
                  onChange={handleIntegrationChange} 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!isValid}
            >
              {widget ? 'Save Changes' : 'Create Widget'}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Preview Panel */}
      <div className="lg:col-span-1">
        <Card className="w-full sticky top-4">
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
            <CardDescription>
              See how your widget will appear
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Device Toggle */}
            <div className="flex justify-center mb-4 border rounded-lg p-1">
              <button
                className={`flex-1 py-1 px-2 rounded-md text-sm ${previewDevice === 'desktop' ? 'bg-primary text-white' : ''}`}
                onClick={() => setPreviewDevice('desktop')}
              >
                Desktop
              </button>
              <button
                className={`flex-1 py-1 px-2 rounded-md text-sm ${previewDevice === 'mobile' ? 'bg-primary text-white' : ''}`}
                onClick={() => setPreviewDevice('mobile')}
              >
                Mobile
              </button>
            </div>
            
            {/* State Toggle */}
            <div className="flex justify-center mb-6 border rounded-lg p-1">
              <button
                className={`flex-1 py-1 px-2 rounded-md text-xs ${previewState === 'initial' ? 'bg-primary text-white' : ''}`}
                onClick={() => setPreviewState('initial')}
              >
                Initial
              </button>
              <button
                className={`flex-1 py-1 px-2 rounded-md text-xs ${previewState === 'expanded' ? 'bg-primary text-white' : ''}`}
                onClick={() => setPreviewState('expanded')}
              >
                Expanded
              </button>
              <button
                className={`flex-1 py-1 px-2 rounded-md text-xs ${previewState === 'confirmation' ? 'bg-primary text-white' : ''}`}
                onClick={() => setPreviewState('confirmation')}
              >
                Confirmation
              </button>
            </div>
            
            {/* Preview Container */}
            <div className={`relative ${previewDevice === 'desktop' ? 'w-full h-[500px]' : 'w-[320px] h-[568px] mx-auto'} bg-gray-100 rounded-lg overflow-hidden border`}>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 opacity-50"></div>
              
              {/* Mock Website Content */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-white border-b flex items-center px-4">
                <div className="w-24 h-6 bg-gray-200 rounded"></div>
                <div className="ml-auto flex space-x-4">
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
              
              <div className="absolute top-20 left-8 right-8">
                <div className="w-3/4 h-8 bg-gray-300 rounded mb-4"></div>
                <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-2/3 h-4 bg-gray-200 rounded mb-6"></div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="h-32 bg-gray-300 rounded"></div>
                  <div className="h-32 bg-gray-300 rounded"></div>
                </div>
                
                <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-4/5 h-4 bg-gray-200 rounded"></div>
              </div>
              
              {/* Widget Preview */}
              <WidgetPreview 
                widget={currentWidget}
                state={previewState}
                device={previewDevice}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
