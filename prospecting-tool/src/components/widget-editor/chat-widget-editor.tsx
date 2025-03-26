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
import { Layout, Settings, MessageSquare, Code, Bot } from "lucide-react";
import { DesignTab } from "@/components/widget-editor/design-tab";
import { BehaviorTab } from "@/components/widget-editor/behavior-tab";
import { ContentTab } from "@/components/widget-editor/content-tab";
import { ChatConfigTab } from "@/components/widget-editor/chat-config-tab";
import { ChatWidgetPreview } from "@/components/widget-editor/chat-widget-preview";
import { ChatWidget, defaultChatWidget } from "@/components/widget-editor/chat-widget-types";

interface ChatWidgetEditorProps {
  widget?: ChatWidget;
  onSave: (widget: ChatWidget) => void;
  onCancel: () => void;
}

export function ChatWidgetEditor({ widget, onSave, onCancel }: ChatWidgetEditorProps) {
  const [currentWidget, setCurrentWidget] = useState<ChatWidget>(widget || defaultChatWidget);
  const [activeTab, setActiveTab] = useState("design");
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewState, setPreviewState] = useState<'initial' | 'expanded' | 'conversation'>('expanded');
  const [isValid, setIsValid] = useState(false);

  // Validate widget data
  useEffect(() => {
    // Basic validation
    const designValid = currentWidget.design.primaryColor && currentWidget.design.position;
    const contentValid = currentWidget.content.title && currentWidget.content.description;
    const behaviorValid = currentWidget.behavior.trigger !== undefined;
    const chatConfigValid = currentWidget.chatConfig.welcomeMessage && currentWidget.chatConfig.teamName;
    
    // Ensure we're passing a boolean to setIsValid
    setIsValid(Boolean(designValid && contentValid && behaviorValid && chatConfigValid));
  }, [currentWidget]);

  // Update widget design
  const handleDesignChange = (design: ChatWidget['design']) => {
    setCurrentWidget(prev => ({
      ...prev,
      design: {
        ...prev.design,
        ...design
      }
    }));
  };

  // Update widget content
  const handleContentChange = (content: ChatWidget['content']) => {
    setCurrentWidget(prev => ({
      ...prev,
      content: {
        ...prev.content,
        ...content
      }
    }));
  };

  // Update widget behavior
  const handleBehaviorChange = (behavior: ChatWidget['behavior']) => {
    setCurrentWidget(prev => ({
      ...prev,
      behavior: {
        ...prev.behavior,
        ...behavior
      }
    }));
  };

  // Update chat config
  const handleChatConfigChange = (chatConfig: ChatWidget['chatConfig']) => {
    setCurrentWidget(prev => ({
      ...prev,
      chatConfig: {
        ...prev.chatConfig,
        ...chatConfig
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
            <CardTitle>{widget ? 'Edit Chat Widget' : 'Create New Chat Widget'}</CardTitle>
            <CardDescription>
              {widget 
                ? `Editing "${widget.name}"`
                : 'Configure your new chat support widget'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Widget Name Input */}
            <div className="mb-6">
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
                  <MessageSquare className="h-4 w-4" />
                  <span>Content</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span>Chat</span>
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
                  onChange={handleContentChange} 
                />
              </TabsContent>
              
              <TabsContent value="chat">
                <ChatConfigTab 
                  chatConfig={currentWidget.chatConfig} 
                  onChange={handleChatConfigChange} 
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
              See how your chat widget will appear
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
                className={`flex-1 py-1 px-2 rounded-md text-xs ${previewState === 'conversation' ? 'bg-primary text-white' : ''}`}
                onClick={() => setPreviewState('conversation')}
              >
                Conversation
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
              <ChatWidgetPreview 
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
