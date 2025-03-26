import { Widget, WidgetType } from "./widget-types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, MessageSquare, Calendar } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContentTabProps {
  content: Widget['content'];
  widgetType?: WidgetType;
  onChange: (content: Widget['content']) => void;
}

export function ContentTab({ content, widgetType = 'MultiWidget', onChange }: ContentTabProps) {
  const [newQuickResponse, setNewQuickResponse] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  
  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Widget['content']
  ) => {
    onChange({
      ...content,
      [field]: e.target.value
    });
  };
  
  // Handle adding a quick response
  const handleAddQuickResponse = () => {
    if (!newQuickResponse.trim()) return;
    
    const updatedResponses = [
      ...(content.quickResponses || []),
      newQuickResponse.trim()
    ];
    
    onChange({
      ...content,
      quickResponses: updatedResponses
    });
    
    setNewQuickResponse("");
  };
  
  // Handle removing a quick response
  const handleRemoveQuickResponse = (index: number) => {
    const updatedResponses = [...(content.quickResponses || [])];
    updatedResponses.splice(index, 1);
    
    onChange({
      ...content,
      quickResponses: updatedResponses
    });
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="chat">Chat Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          {/* Widget Title */}
          <div className="space-y-2">
            <Label htmlFor="widget-title">Widget Title</Label>
            <Input
              id="widget-title"
              value={content.title}
              onChange={(e) => handleInputChange(e, 'title')}
              placeholder="Enter widget title"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              The main heading displayed in your widget
            </p>
          </div>
          
          {/* Widget Description */}
          <div className="space-y-2">
            <Label htmlFor="widget-description">Description</Label>
            <Textarea
              id="widget-description"
              value={content.description}
              onChange={(e) => handleInputChange(e, 'description')}
              placeholder="Enter widget description"
              className="w-full min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              A brief description of what the widget is for
            </p>
          </div>
          
          {/* CTA Text */}
          <div className="space-y-2">
            <Label htmlFor="cta-text">Call-to-Action Text</Label>
            <Input
              id="cta-text"
              value={content.ctaText}
              onChange={(e) => handleInputChange(e, 'ctaText')}
              placeholder="Enter call-to-action text"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              The text displayed on the primary button
            </p>
          </div>
          
          {/* Thank You Message */}
          <div className="space-y-2">
            <Label htmlFor="thank-you-message">Thank You Message</Label>
            <Textarea
              id="thank-you-message"
              value={content.thankYouMessage}
              onChange={(e) => handleInputChange(e, 'thankYouMessage')}
              placeholder="Enter thank you message"
              className="w-full min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Message displayed after a visitor submits information
            </p>
          </div>
          
          {/* Host Information */}
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Host Information</h3>
            </div>
            
            {/* Host Name */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="host-name">Host Name</Label>
              <Input
                id="host-name"
                value={content.hostName || ''}
                onChange={(e) => handleInputChange(e, 'hostName')}
                placeholder="Enter host name"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Name of the person or team who will be responding
              </p>
            </div>
            
            {/* Host Title */}
            <div className="space-y-2">
              <Label htmlFor="host-title">Host Title</Label>
              <Input
                id="host-title"
                value={content.hostTitle || ''}
                onChange={(e) => handleInputChange(e, 'hostTitle')}
                placeholder="Enter host title"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Job title or role of the host
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="chat" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Chat Settings</h3>
          </div>
          
          {/* Welcome Message */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="welcome-message">Welcome Message</Label>
            <Textarea
              id="welcome-message"
              value={content.welcomeMessage || 'Hi there! How can we help you today?'}
              onChange={(e) => handleInputChange(e, 'welcomeMessage')}
              placeholder="Enter welcome message"
              className="w-full min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              The first message visitors will see when they open the chat
            </p>
          </div>
          
          {/* Quick Responses */}
          <div className="space-y-2">
            <Label>Quick Response Options</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Predefined options that visitors can click instead of typing
            </p>
            
            <div className="space-y-2 mb-4">
              {(content.quickResponses || []).map((response, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={response}
                    onChange={(e) => {
                      const updatedResponses = [...(content.quickResponses || [])];
                      updatedResponses[index] = e.target.value;
                      onChange({
                        ...content,
                        quickResponses: updatedResponses
                      });
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveQuickResponse(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                value={newQuickResponse}
                onChange={(e) => setNewQuickResponse(e.target.value)}
                placeholder="Add a quick response option"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddQuickResponse();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddQuickResponse}
                disabled={!newQuickResponse.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
