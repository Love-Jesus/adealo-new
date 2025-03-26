import { useState } from "react";
import { Widget } from "../widget-types";
import { FieldWithHelp } from "../field-with-help";
import { 
  Monitor, 
  Smartphone, 
  Tablet,
  Check,
  Copy,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WidgetPreview } from "../widget-preview";

interface PreviewStepProps {
  widget: Widget;
  name: string;
  onNameChange: (name: string) => void;
}

export function PreviewStep({ widget, name, onNameChange }: PreviewStepProps) {
  // State for preview device
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  
  // State for preview state
  const [previewState, setPreviewState] = useState<'initial' | 'expanded' | 'confirmation'>(
    widget.previewState || 'expanded'
  );
  
  // Update widget's previewState when it changes
  const handlePreviewStateChange = (value: string) => {
    widget.previewState = value as 'initial' | 'expanded' | 'confirmation';
    setPreviewState(value as 'initial' | 'expanded' | 'confirmation');
  };
  
  // State for copy success
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Device options for the toggle
  const deviceOptions = [
    { value: 'desktop', label: 'Desktop', icon: Monitor },
    { value: 'tablet', label: 'Tablet', icon: Tablet },
    { value: 'mobile', label: 'Mobile', icon: Smartphone },
  ];
  
  // State options for the toggle
  const stateOptions = [
    { value: 'initial', label: 'Initial' },
    { value: 'expanded', label: 'Expanded' },
    { value: 'confirmation', label: 'Confirmation' },
  ];
  
  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange(e.target.value);
  };
  
  // Handle copy embed code
  const handleCopyEmbedCode = () => {
    // This is a placeholder - in a real implementation, you would generate
    // and copy the actual embed code for the widget
    const embedCode = `<script src="https://example.com/widget.js" data-widget-id="${widget.id || 'new-widget'}"></script>`;
    navigator.clipboard.writeText(embedCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Preview Your Widget</h3>
        <p className="text-muted-foreground">
          See how your widget will appear to visitors
        </p>
      </div>
      
      {/* Widget Name */}
      <FieldWithHelp
        label="Widget Name"
        helpText="A descriptive name to identify this widget in your dashboard"
        id="widget-name"
      >
        <input
          id="widget-name"
          type="text"
          value={name}
          onChange={handleNameChange}
          className="w-full p-2 border rounded-md bg-background"
          placeholder="Enter widget name"
        />
      </FieldWithHelp>
      
      {/* Widget State Toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Widget State</label>
        <Tabs value={previewState} onValueChange={handlePreviewStateChange} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            {stateOptions.map((state) => (
              <TabsTrigger key={state.value} value={state.value}>
                {state.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Note: Widget Preview removed from here as requested - only keeping the right-side preview */}
      
      {/* Final Checklist */}
      <div className="space-y-4 p-4 bg-muted/10 rounded-md border">
        <h4 className="font-medium">Before You Save</h4>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-1" />
            <div>
              <span className="font-medium">Design:</span>
              <span className="text-muted-foreground ml-1">Colors and positioning look good</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-1" />
            <div>
              <span className="font-medium">Behavior:</span>
              <span className="text-muted-foreground ml-1">Trigger and display settings are configured</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-1" />
            <div>
              <span className="font-medium">Content:</span>
              <span className="text-muted-foreground ml-1">Text and messaging are clear and compelling</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-1" />
            <div>
              <span className="font-medium">Integration:</span>
              <span className="text-muted-foreground ml-1">External services and data collection are set up</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Next Steps */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
        <div className="flex items-start gap-3">
          <ExternalLink className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-300">Next Steps</h4>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              After saving, you'll get an embed code to add the widget to your website.
              You can always come back to edit your widget or create new ones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
