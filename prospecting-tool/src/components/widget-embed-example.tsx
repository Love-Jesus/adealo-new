import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Code, Copy, Check, ExternalLink } from "lucide-react";

interface WidgetEmbedExampleProps {
  widgetId: string;
  widgetName: string;
  primaryColor?: string;
  secondaryColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  title?: string;
  description?: string;
  ctaText?: string;
  calendlyUrl?: string;
  onClose?: () => void;
}

export function WidgetEmbedExample({ 
  widgetId, 
  widgetName,
  primaryColor = '#3A36DB',
  secondaryColor = '#FFFFFF',
  position = 'bottom-right',
  title = 'Book a Demo with Our Team',
  description = 'Learn how our solution can help your business grow',
  ctaText = 'Schedule a Meeting',
  calendlyUrl = 'https://calendly.com/your-calendly-link',
  onClose 
}: WidgetEmbedExampleProps) {
  const [copied, setCopied] = useState(false);

    // Generate a simple embed code
  const generateEmbedCode = () => {
    return `
<!-- Adealo Widget Embed Code -->
<script>
  (function() {
    // Widget configuration
    const widgetConfig = {
      id: "${widgetId || 'example-widget-id'}",
      type: "MultiWidget",
      design: {
        position: "${position}",
        primaryColor: "${primaryColor}",
        secondaryColor: "${secondaryColor}",
        theme: "light",
        borderRadius: 8,
        fontFamily: "Inter, system-ui, sans-serif"
      },
      content: {
        title: "${title}",
        description: "${description}",
        ctaText: "${ctaText}",
        welcomeMessage: "👋 Hi there! How can we help you today?",
        quickResponses: ["Book a demo", "Chat with an expert", "Get support"]
      },
      integration: {
        calendlyUrl: "${calendlyUrl}",
        collectLeadData: true,
        requiredFields: ["email", "name"],
        collectVisitorInfo: true
      },
      chatConfig: {
        offlineMessage: "We're currently offline. Leave a message and we'll get back to you soon.",
        inputPlaceholder: "Type your message...",
        useAI: true,
        teamName: "Support Team",
        responseTime: "Usually responds in a few minutes",
        showAgentNames: true,
        showAgentAvatars: true,
        fileAttachmentsEnabled: true
      }
    };
    
    // Create widget container
    function createWidgetContainer() {
      const container = document.createElement('div');
      container.id = 'adealo-widget-' + widgetConfig.id;
      container.style.position = 'fixed';
      
      // Set position based on configuration
      switch (widgetConfig.design.position) {
        case 'bottom-right':
          container.style.bottom = '20px';
          container.style.right = '20px';
          break;
        case 'bottom-left':
          container.style.bottom = '20px';
          container.style.left = '20px';
          break;
        case 'top-right':
          container.style.top = '20px';
          container.style.right = '20px';
          break;
        case 'top-left':
          container.style.top = '20px';
          container.style.left = '20px';
          break;
        default:
          container.style.bottom = '20px';
          container.style.right = '20px';
      }
      
      container.style.zIndex = '9999';
      document.body.appendChild(container);
      return container;
    }
    
    // Create widget button
    function createWidgetButton(container) {
      const button = document.createElement('button');
      button.id = 'adealo-widget-button-' + widgetConfig.id;
      button.style.width = '60px';
      button.style.height = '60px';
      button.style.borderRadius = '50%';
      button.style.backgroundColor = widgetConfig.design.primaryColor;
      button.style.color = widgetConfig.design.secondaryColor;
      button.style.border = 'none';
      button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      button.style.cursor = 'pointer';
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
      
      button.addEventListener('click', function() {
        showWidgetContent(container);
      });
      
      container.appendChild(button);
      return button;
    }
    
    // Create widget content
    function createWidgetContent(container) {
      const content = document.createElement('div');
      content.id = 'adealo-widget-content-' + widgetConfig.id;
      content.style.display = 'none';
      content.style.width = '320px';
      content.style.backgroundColor = '#ffffff';
      content.style.color = '#1a1a1a';
      content.style.borderRadius = widgetConfig.design.borderRadius + 'px';
      content.style.overflow = 'hidden';
      content.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      content.style.fontFamily = widgetConfig.design.fontFamily;
      
      // Create header
      const header = document.createElement('div');
      header.style.backgroundColor = widgetConfig.design.primaryColor;
      header.style.color = widgetConfig.design.secondaryColor;
      header.style.padding = '16px';
      header.style.position = 'relative';
      
      const title = document.createElement('h3');
      title.style.margin = '0 0 8px 0';
      title.style.fontSize = '18px';
      title.style.fontWeight = '600';
      title.textContent = widgetConfig.content.title;
      
      const description = document.createElement('p');
      description.style.margin = '0';
      description.style.fontSize = '14px';
      description.style.opacity = '0.9';
      description.textContent = widgetConfig.content.description;
      
      const closeButton = document.createElement('button');
      closeButton.style.position = 'absolute';
      closeButton.style.top = '12px';
      closeButton.style.right = '12px';
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.color = 'inherit';
      closeButton.style.cursor = 'pointer';
      closeButton.style.opacity = '0.7';
      closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      closeButton.addEventListener('click', function() {
        hideWidgetContent(container);
      });
      
      header.appendChild(title);
      header.appendChild(description);
      header.appendChild(closeButton);
      
      // Create body
      const body = document.createElement('div');
      body.style.padding = '16px';
      
      // Create CTA button
      const ctaButton = document.createElement('button');
      ctaButton.style.width = '100%';
      ctaButton.style.padding = '10px 16px';
      ctaButton.style.backgroundColor = widgetConfig.design.primaryColor;
      ctaButton.style.color = widgetConfig.design.secondaryColor;
      ctaButton.style.border = 'none';
      ctaButton.style.borderRadius = '4px';
      ctaButton.style.fontSize = '14px';
      ctaButton.style.fontWeight = '500';
      ctaButton.style.cursor = 'pointer';
      ctaButton.style.display = 'flex';
      ctaButton.style.alignItems = 'center';
      ctaButton.style.justifyContent = 'space-between';
      ctaButton.textContent = widgetConfig.content.ctaText;
      
      const arrowIcon = document.createElement('span');
      arrowIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
      ctaButton.appendChild(arrowIcon);
      
      ctaButton.addEventListener('click', function() {
        window.open(widgetConfig.integration.calendlyUrl, '_blank');
      });
      
      body.appendChild(ctaButton);
      
      // Add powered by
      const poweredBy = document.createElement('div');
      poweredBy.style.textAlign = 'center';
      poweredBy.style.fontSize = '11px';
      poweredBy.style.opacity = '0.5';
      poweredBy.style.marginTop = '12px';
      poweredBy.textContent = 'Powered by Adealo';
      
      body.appendChild(poweredBy);
      
      content.appendChild(header);
      content.appendChild(body);
      container.appendChild(content);
      
      return content;
    }
    
    // Show widget content
    function showWidgetContent(container) {
      const button = document.getElementById('adealo-widget-button-' + widgetConfig.id);
      const content = document.getElementById('adealo-widget-content-' + widgetConfig.id);
      
      button.style.display = 'none';
      content.style.display = 'block';
    }
    
    // Hide widget content
    function hideWidgetContent(container) {
      const button = document.getElementById('adealo-widget-button-' + widgetConfig.id);
      const content = document.getElementById('adealo-widget-content-' + widgetConfig.id);
      
      content.style.display = 'none';
      button.style.display = 'flex';
    }
    
    // Initialize widget
    function initWidget() {
      const container = createWidgetContainer();
      const button = createWidgetButton(container);
      const content = createWidgetContent(container);
    }
    
    // Check if document is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      initWidget();
    } else {
      // Otherwise wait for DOMContentLoaded
      document.addEventListener('DOMContentLoaded', initWidget);
    }
  })();
</script>
<!-- End Adealo Widget Embed Code -->
    `;
  };

  const embedCode = generateEmbedCode();

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          <CardTitle>Example Widget Embed Code</CardTitle>
        </div>
        <CardDescription>
          This is an example embed code for the "{widgetName}" widget. Use this as a fallback if the Firebase function is not working.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Instructions:</h3>
          <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
            <li>Copy the code below</li>
            <li>Paste it just before the closing <code className="bg-muted px-1 py-0.5 rounded">&lt;/body&gt;</code> tag in your HTML</li>
            <li>Update the <code className="bg-muted px-1 py-0.5 rounded">calendlyUrl</code> with your actual Calendly URL</li>
            <li>The widget will automatically appear on your website</li>
          </ol>
        </div>
        
        <div className="relative">
          <pre className="p-4 bg-muted rounded-md overflow-auto max-h-[300px] text-xs">
            <code>{embedCode}</code>
          </pre>
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-700 text-sm">
          <p className="flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>
              This is a simplified example widget. For full functionality, please deploy the Firebase functions.
            </span>
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
        
        <Button 
          variant="link" 
          className="ml-auto text-primary"
          onClick={() => window.open('https://docs.adealo.com/widgets/installation', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          View Documentation
        </Button>
      </CardFooter>
    </Card>
  );
}
