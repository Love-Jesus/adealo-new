import { useEffect } from "react";
import { Widget } from "../widget-types";
import { FieldWithHelp } from "../field-with-help";
import { 
  Calendar, 
  Link,
  Database,
  Mail,
  User,
  Phone,
  MessageSquare,
  AlertTriangle
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface IntegrationStepProps {
  integration: Widget['integration'];
  widgetType: string;
  onChange: (integration: Widget['integration']) => void;
  onValidChange: (isValid: boolean) => void;
}

export function IntegrationStep({ integration, widgetType, onChange, onValidChange }: IntegrationStepProps) {
  // Field options
  const fieldOptions = [
    { id: 'name', label: 'Name', icon: User, required: false },
    { id: 'email', label: 'Email', icon: Mail, required: true },
    { id: 'phone', label: 'Phone Number', icon: Phone, required: false },
    { id: 'company', label: 'Company', icon: Database, required: false },
    { id: 'message', label: 'Message', icon: MessageSquare, required: false },
  ];
  
  // Handle Calendly URL change
  const handleCalendlyUrlChange = (url: string) => {
    onChange({
      ...integration,
      calendlyUrl: url
    });
  };
  
  // Handle lead data collection toggle
  const handleLeadDataCollectionChange = (checked: boolean) => {
    onChange({
      ...integration,
      collectLeadData: checked
    });
  };
  
  // Handle required field toggle
  const handleRequiredFieldChange = (field: string, checked: boolean) => {
    const currentFields = [...integration.requiredFields];
    
    if (checked && !currentFields.includes(field)) {
      // Add field to required fields
      onChange({
        ...integration,
        requiredFields: [...currentFields, field]
      });
    } else if (!checked && currentFields.includes(field)) {
      // Remove field from required fields
      onChange({
        ...integration,
        requiredFields: currentFields.filter(f => f !== field)
      });
    }
  };
  
  // Validate integration settings
  useEffect(() => {
    const isValid = widgetType === 'Book Demo' ? 
      !!integration.calendlyUrl : true;
    onValidChange(isValid);
  }, [integration, widgetType, onValidChange]);
  
  return (
    <div className="space-y-8">
      {/* Calendly Integration (for Book Demo widgets) */}
      {widgetType === 'Book Demo' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Calendly Integration
            </h3>
            <p className="text-muted-foreground">
              Connect your Calendly account to allow visitors to schedule meetings
            </p>
          </div>
          
          <FieldWithHelp
            label="Calendly URL"
            helpText="The URL of your Calendly scheduling page"
            id="calendly-url"
          >
            <div className="flex">
              <div className="bg-muted p-2 flex items-center rounded-l-md border border-r-0">
                <Link className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                id="calendly-url"
                type="text"
                value={integration.calendlyUrl}
                onChange={(e) => handleCalendlyUrlChange(e.target.value)}
                placeholder="e.g., https://calendly.com/yourname/30min"
                className="flex-1 p-2 border rounded-r-md bg-background"
              />
            </div>
          </FieldWithHelp>
          
          {!integration.calendlyUrl && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-700 dark:text-amber-300">Calendly URL Required</h4>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                    You need to provide a Calendly URL to allow visitors to schedule meetings.
                    <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                      Get a free Calendly account
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Lead Data Collection */}
      <div className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="lead-data-collection" className="text-base font-medium">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Collect Lead Data</span>
              </div>
            </Label>
            <p className="text-sm text-muted-foreground">
              Gather visitor information before they interact with the widget
            </p>
          </div>
          <Switch
            id="lead-data-collection"
            checked={integration.collectLeadData}
            onCheckedChange={handleLeadDataCollectionChange}
          />
        </div>
        
        {integration.collectLeadData && (
          <div className="space-y-4 p-4 bg-muted/10 rounded-md border">
            <h4 className="font-medium">Required Fields</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Select which fields visitors must fill out
            </p>
            
            <div className="space-y-3">
              {fieldOptions.map(field => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`field-${field.id}`} 
                    checked={integration.requiredFields.includes(field.id) || field.required}
                    onCheckedChange={(checked) => handleRequiredFieldChange(field.id, checked as boolean)}
                    disabled={field.required}
                  />
                  <label
                    htmlFor={`field-${field.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <field.icon className="h-4 w-4 text-muted-foreground" />
                    {field.label}
                    {field.required && (
                      <span className="text-xs text-muted-foreground">(Always required)</span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Integration Tips */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mt-6">
        <div className="flex items-start gap-3">
          <Database className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-700 dark:text-green-300">Integration Tips</h4>
            <ul className="text-sm text-green-600 dark:text-green-400 mt-1 space-y-1 list-disc pl-4">
              <li>Collect only the information you really need</li>
              <li>More required fields can reduce conversion rates</li>
              <li>Make sure your Calendly is properly configured</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
