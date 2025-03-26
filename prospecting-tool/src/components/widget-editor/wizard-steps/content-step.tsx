import { useEffect, useState } from "react";
import { Widget } from "../widget-types";
import { FieldWithHelp } from "../field-with-help";
import { 
  MessageSquare,
  User,
  Briefcase,
  FileText,
  Upload,
  X
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ContentStepProps {
  content: Widget['content'];
  onChange: (content: Widget['content']) => void;
  onValidChange: (isValid: boolean) => void;
}

export function ContentStep({ content, onChange, onValidChange }: ContentStepProps) {
  // Handle text change
  const handleTextChange = (field: keyof Widget['content'], value: string) => {
    onChange({
      ...content,
      [field]: value
    });
  };
  
  // Validate content settings
  useEffect(() => {
    const isValid = !!content.title && !!content.ctaText;
    onValidChange(isValid);
  }, [content, onValidChange]);
  
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Widget Content</h3>
        <p className="text-muted-foreground">
          Customize the text that appears in your widget
        </p>
      </div>
      
      {/* Widget Title */}
      <FieldWithHelp
        label="Widget Title"
        helpText="The main heading displayed in your widget"
        id="widget-title"
      >
        <div className="flex">
          <div className="bg-muted p-2 flex items-center rounded-l-md border border-r-0">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            id="widget-title"
            type="text"
            value={content.title}
            onChange={(e) => handleTextChange('title', e.target.value)}
            placeholder="e.g., Book a Demo with Our Team"
            className="flex-1 p-2 border rounded-r-md bg-background"
          />
        </div>
      </FieldWithHelp>
      
      {/* Widget Description */}
      <FieldWithHelp
        label="Widget Description"
        helpText="A brief description of what visitors can expect"
        id="widget-description"
      >
        <div className="flex">
          <div className="bg-muted p-2 flex items-center rounded-l-md border border-r-0">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            id="widget-description"
            type="text"
            value={content.description}
            onChange={(e) => handleTextChange('description', e.target.value)}
            placeholder="e.g., Learn how our solution can help your business grow"
            className="flex-1 p-2 border rounded-r-md bg-background"
          />
        </div>
      </FieldWithHelp>
      
      {/* CTA Text */}
      <FieldWithHelp
        label="Call-to-Action Button"
        helpText="The text on the button that visitors will click"
        id="cta-text"
      >
        <div className="flex">
          <div className="bg-primary/10 p-2 flex items-center rounded-l-md border border-r-0 border-primary/20">
            <div className="h-4 w-4 rounded-sm bg-primary text-white flex items-center justify-center text-[10px] font-bold">
              CTA
            </div>
          </div>
          <input
            id="cta-text"
            type="text"
            value={content.ctaText}
            onChange={(e) => handleTextChange('ctaText', e.target.value)}
            placeholder="e.g., Schedule a Meeting"
            className="flex-1 p-2 border border-primary/20 rounded-r-md bg-background"
          />
        </div>
      </FieldWithHelp>
      
      {/* Thank You Message */}
      <FieldWithHelp
        label="Thank You Message"
        helpText="Shown after a visitor completes the action"
        id="thank-you-message"
      >
        <Textarea
          id="thank-you-message"
          value={content.thankYouMessage}
          onChange={(e) => handleTextChange('thankYouMessage', e.target.value)}
          placeholder="e.g., Thanks for booking! We'll see you soon."
          className="resize-none"
          rows={2}
        />
      </FieldWithHelp>
      
      {/* Host Information */}
      <div className="space-y-4 p-4 bg-muted/10 rounded-md border">
        <h4 className="font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          Host Information (Optional)
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          Adding host details creates a more personal experience
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Host Name */}
          <div className="space-y-2">
            <label htmlFor="host-name" className="text-sm font-medium">
              Host Name
            </label>
            <div className="flex">
              <div className="bg-muted p-2 flex items-center rounded-l-md border border-r-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                id="host-name"
                type="text"
                value={content.hostName || ''}
                onChange={(e) => handleTextChange('hostName', e.target.value)}
                placeholder="e.g., Jane Smith"
                className="flex-1 p-2 border rounded-r-md bg-background"
              />
            </div>
          </div>
          
          {/* Host Title */}
          <div className="space-y-2">
            <label htmlFor="host-title" className="text-sm font-medium">
              Host Title
            </label>
            <div className="flex">
              <div className="bg-muted p-2 flex items-center rounded-l-md border border-r-0">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                id="host-title"
                type="text"
                value={content.hostTitle || ''}
                onChange={(e) => handleTextChange('hostTitle', e.target.value)}
                placeholder="e.g., Product Specialist"
                className="flex-1 p-2 border rounded-r-md bg-background"
              />
            </div>
          </div>
        </div>
        
        {/* Host Photo */}
        <div className="mt-4">
          <label className="text-sm font-medium mb-2 block">
            Host Photo
          </label>
          
          <div className="flex items-start gap-4">
            {/* Photo Preview */}
            <div className="w-24 h-24 rounded-md border bg-muted/30 flex items-center justify-center overflow-hidden">
              {content.hostPhoto ? (
                <div className="relative w-full h-full">
                  <img 
                    src={content.hostPhoto} 
                    alt="Host" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleTextChange('hostPhoto', '')}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <User className="h-8 w-8 text-muted-foreground/50" />
              )}
            </div>
            
            {/* Upload Controls */}
            <div className="flex-1">
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  id="host-photo"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          handleTextChange('hostPhoto', event.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label htmlFor="host-photo">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => document.getElementById('host-photo')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, at least 200x200px
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Preview */}
      <div className="mt-6 p-4 bg-muted/20 rounded-md border">
        <h4 className="font-medium mb-3">Content Preview</h4>
        <div className="bg-card p-4 rounded-md border shadow-sm">
          <div className="font-medium text-lg">{content.title || 'Widget Title'}</div>
          <div className="text-sm text-muted-foreground mb-4">{content.description || 'Widget description goes here'}</div>
          
          {(content.hostName || content.hostTitle || content.hostPhoto) && (
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                {content.hostPhoto ? (
                  <img 
                    src={content.hostPhoto} 
                    alt={content.hostName || 'Host'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                {content.hostName && <div className="font-medium">{content.hostName}</div>}
                {content.hostTitle && <div className="text-xs text-muted-foreground">{content.hostTitle}</div>}
              </div>
            </div>
          )}
          
          <button className="w-full py-2 px-4 bg-primary text-white rounded-md text-center">
            {content.ctaText || 'Call to Action'}
          </button>
        </div>
      </div>
    </div>
  );
}
