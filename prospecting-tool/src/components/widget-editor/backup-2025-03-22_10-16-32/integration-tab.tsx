import { useState } from "react";
import { Widget, WidgetType } from "./widget-types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Check, ExternalLink, Code, MessageSquare, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IntegrationTabProps {
  integration: Widget['integration'];
  chatConfig?: Widget['chatConfig'];
  widgetType?: WidgetType;
  onChange: (integration: Widget['integration']) => void;
  onChatConfigChange?: (chatConfig: Widget['chatConfig']) => void;
}

export function IntegrationTab({ 
  integration, 
  chatConfig, 
  widgetType = 'MultiWidget', 
  onChange,
  onChatConfigChange
}: IntegrationTabProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("booking");
  
  // Field options
  const fieldOptions = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone" },
    { id: "company", label: "Company" },
    { id: "website", label: "Website" },
  ];
  
  // Handle Calendly URL change
  const handleCalendlyUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...integration,
      calendlyUrl: e.target.value
    });
  };
  
  // Handle lead data collection toggle
  const handleLeadDataToggle = (checked: boolean) => {
    onChange({
      ...integration,
      collectLeadData: checked
    });
  };
  
  // Handle required field toggle
  const handleRequiredFieldToggle = (field: string, checked: boolean) => {
    const newRequiredFields = checked
      ? [...integration.requiredFields, field]
      : integration.requiredFields.filter((f: string) => f !== field);
    
    onChange({
      ...integration,
      requiredFields: newRequiredFields
    });
  };
  
  // Handle support team ID change
  const handleSupportTeamIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...integration,
      supportTeamId: e.target.value
    });
  };
  
  // Handle visitor info collection toggle
  const handleVisitorInfoToggle = (checked: boolean) => {
    onChange({
      ...integration,
      collectVisitorInfo: checked
    });
  };
  
  // Handle AI toggle
  const handleAIToggle = (checked: boolean) => {
    if (onChatConfigChange && chatConfig) {
      onChatConfigChange({
        ...chatConfig,
        useAI: checked
      });
    }
  };

  // Generate installation code
  const generateInstallationCode = () => {
    // This is a simplified example - in a real implementation, this would generate
    // actual JavaScript code that could be embedded in a website
    return `
<!-- Adealo MultiWidget Code -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AdealoWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    w[o].l=1*new Date();js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.async=1;js.src=f;js.id=o;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','adealo','https://widgets.adealo.com/loader.js'));
  
  adealo('init', {
    widgetId: 'widget-123',
    type: 'MultiWidget',
    calendlyUrl: '${integration.calendlyUrl}',
    collectLeadData: ${integration.collectLeadData},
    requiredFields: ${JSON.stringify(integration.requiredFields)},
    supportTeamId: '${integration.supportTeamId || ""}',
    collectVisitorInfo: ${integration.collectVisitorInfo || false}
  });
</script>
<!-- End Adealo MultiWidget Code -->
    `.trim();
  };
  
  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateInstallationCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Check if Calendly URL is valid
  const isCalendlyUrlValid = integration.calendlyUrl.includes('calendly.com');
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="booking" className="space-y-6">
          {/* Calendly Integration */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Calendly Integration</h3>
            </div>
            
            <Label htmlFor="calendly-url">Calendly URL</Label>
            <Input
              id="calendly-url"
              value={integration.calendlyUrl}
              onChange={handleCalendlyUrlChange}
              placeholder="https://calendly.com/your-name/30min"
              className={`w-full ${!isCalendlyUrlValid && integration.calendlyUrl ? 'border-red-500' : ''}`}
            />
            {!isCalendlyUrlValid && integration.calendlyUrl ? (
              <p className="text-xs text-red-500">
                Please enter a valid Calendly URL
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Enter your Calendly scheduling page URL
              </p>
            )}
            
            {integration.calendlyUrl && isCalendlyUrlValid && (
              <div className="mt-2">
                <a
                  href={integration.calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Calendly page</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
          
          {/* Lead Data Collection */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="collect-lead-data" className="block">Collect Lead Data</Label>
              <p className="text-xs text-muted-foreground">
                Capture visitor information before scheduling
              </p>
            </div>
            <Switch 
              id="collect-lead-data"
              checked={integration.collectLeadData}
              onCheckedChange={handleLeadDataToggle}
            />
          </div>
          
          {/* Required Fields */}
          {integration.collectLeadData && (
            <div className="space-y-2 border-t pt-4 mt-4">
              <Label>Required Fields</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select which fields visitors must fill out before scheduling
              </p>
              
              <div className="space-y-2">
                {fieldOptions.map(field => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${field.id}`}
                      checked={integration.requiredFields.includes(field.id)}
                      onCheckedChange={(checked) => 
                        handleRequiredFieldToggle(field.id, checked === true)
                      }
                    />
                    <Label 
                      htmlFor={`field-${field.id}`}
                      className="text-sm font-normal"
                    >
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="chat" className="space-y-6">
          {/* Support Chat Integration */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Support Chat Integration</h3>
            </div>
            
            <Label htmlFor="support-team-id">Support Team ID (Optional)</Label>
            <Input
              id="support-team-id"
              value={integration.supportTeamId || ''}
              onChange={handleSupportTeamIdChange}
              placeholder="team-123"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter your support team ID to route chats to specific team members
            </p>
          </div>
          
          {/* Visitor Info Collection */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="collect-visitor-info" className="block">Collect Visitor Info</Label>
              <p className="text-xs text-muted-foreground">
                Automatically capture visitor information (IP, location, etc.)
              </p>
            </div>
            <Switch 
              id="collect-visitor-info"
              checked={integration.collectVisitorInfo || false}
              onCheckedChange={handleVisitorInfoToggle}
            />
          </div>
          
          {/* AI Assistant */}
          {chatConfig && onChatConfigChange && (
            <div className="flex items-center justify-between mt-4">
              <div>
                <Label htmlFor="use-ai" className="block">AI Assistant</Label>
                <p className="text-xs text-muted-foreground">
                  Enable AI to handle initial visitor inquiries
                </p>
              </div>
              <Switch 
                id="use-ai"
                checked={chatConfig.useAI || false}
                onCheckedChange={handleAIToggle}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Installation Code */}
      <div className="space-y-2 border-t pt-4 mt-4">
        <div className="flex items-center justify-between">
          <Label>Installation Code</Label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyCode}
            className="h-8"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1" />
                <span>Copy Code</span>
              </>
            )}
          </Button>
        </div>
        
        <div className="relative">
          <div className="absolute top-3 right-3">
            <Code className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <pre className="p-4 bg-muted/30 rounded-md text-xs overflow-x-auto">
            {generateInstallationCode()}
          </pre>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Add this code to your website before the closing &lt;/body&gt; tag
        </p>
      </div>
    </div>
  );
}
