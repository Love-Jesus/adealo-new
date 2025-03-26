import { useState, useEffect } from "react";
import { Widget, defaultWidget } from "./widget-types";
import { ChatWidget, defaultChatWidget } from "./chat-widget-types";
import { EnhancedTabsNavigation } from "./enhanced-tabs-navigation";
import { EnhancedPreview } from "./enhanced-preview";
import { EnhancedDesignTab } from "./enhanced-design-tab";
import { ProgressIndicator } from "./progress-indicator";
import { VisualWidgetTypeSelector } from "./visual-widget-type-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldWithHelp } from "./field-with-help";
import { AlertCircle, Save, X } from "lucide-react";

interface EnhancedWidgetEditorProps {
  widget?: Widget | ChatWidget;
  onSave: (widget: Widget | ChatWidget) => void;
  onCancel: () => void;
}

export function EnhancedWidgetEditor({ widget, onSave, onCancel }: EnhancedWidgetEditorProps) {
  // State for widget type selection
  const [widgetTypeDialogOpen, setWidgetTypeDialogOpen] = useState(!widget);
  const [selectedWidgetType, setSelectedWidgetType] = useState<'Book Demo' | 'Chat Support'>(
    widget ? widget.type as 'Book Demo' | 'Chat Support' : 'Book Demo'
  );
  
  // State for the current widget
  const [currentWidget, setCurrentWidget] = useState<Widget | ChatWidget>(
    widget || defaultWidget
  );
  
  // State for tabs
  const [primaryTab, setPrimaryTab] = useState<'design' | 'behavior' | 'content' | 'integration'>('design');
  const [secondaryTab, setSecondaryTab] = useState<string>('appearance');
  
  // State for preview
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [previewState, setPreviewState] = useState<'initial' | 'expanded' | 'confirmation'>('expanded');
  
  // State for validation
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // State for current step in the creation process
  const [currentStep, setCurrentStep] = useState(0);
  
  // Define the steps in the widget creation process
  const steps = [
    "Widget Type",
    "Design",
    "Behavior",
    "Content",
    "Integration"
  ];
  
  // Define secondary tabs for each primary tab
  const secondaryTabs = {
    design: ['appearance', 'typography', 'layout', 'media'],
    behavior: ['trigger', 'display', 'targeting'],
    content: ['messages', 'form', 'branding'],
    integration: ['connection', 'data', 'notifications']
  };
  
  // Map primary tabs to steps
  const primaryTabToStep = {
    'design': 1,
    'behavior': 2,
    'content': 3,
    'integration': 4
  };
  
  // Update current step when primary tab changes
  useEffect(() => {
    setCurrentStep(primaryTabToStep[primaryTab]);
  }, [primaryTab]);
  
  // Validate widget data
  useEffect(() => {
    const errors: string[] = [];
    
    // Basic validation
    if (!currentWidget.name) {
      errors.push("Widget name is required");
    }
    
    // Design validation
    if (!currentWidget.design.primaryColor) {
      errors.push("Primary color is required");
    }
    
    // Content validation
    if (!currentWidget.content.title) {
      errors.push("Widget title is required");
    }
    if (!currentWidget.content.ctaText) {
      errors.push("Call-to-action text is required");
    }
    
    // Integration validation for Book Demo widgets
    if (currentWidget.type === 'Book Demo' && !currentWidget.integration.calendlyUrl) {
      errors.push("Calendly URL is required for Book Demo widgets");
    }
    
    setValidationErrors(errors);
    setIsValid(errors.length === 0);
  }, [currentWidget]);
  
  // Handle widget type selection
  const handleWidgetTypeSelect = (type: string) => {
    setSelectedWidgetType(type as 'Book Demo' | 'Chat Support');
  };
  
  // Handle continue after widget type selection
  const handleContinueAfterTypeSelect = () => {
    setWidgetTypeDialogOpen(false);
    
    // Initialize the widget based on the selected type
    if (selectedWidgetType === 'Chat Support') {
      setCurrentWidget({
        ...defaultChatWidget,
        name: `New ${selectedWidgetType} Widget`
      });
    } else {
      setCurrentWidget({
        ...defaultWidget,
        name: `New ${selectedWidgetType} Widget`,
        type: selectedWidgetType
      });
    }
    
    // Move to the design step
    setCurrentStep(1);
    setPrimaryTab('design');
    setSecondaryTab('appearance');
  };
  
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
  
  // Handle step click in progress indicator
  const handleStepClick = (stepIndex: number) => {
    // Only allow clicking on completed steps or the next step
    if (stepIndex <= currentStep) {
      if (stepIndex === 0) {
        setWidgetTypeDialogOpen(true);
      } else {
        // Map step index to primary tab
        const tabMapping: Record<number, 'design' | 'behavior' | 'content' | 'integration'> = {
          1: 'design',
          2: 'behavior',
          3: 'content',
          4: 'integration'
        };
        
        setPrimaryTab(tabMapping[stepIndex]);
        setSecondaryTab(secondaryTabs[tabMapping[stepIndex]][0]);
      }
    }
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
    <>
      {/* Widget Type Selection Dialog */}
      <VisualWidgetTypeSelector
        open={widgetTypeDialogOpen}
        onOpenChange={setWidgetTypeDialogOpen}
        selectedType={selectedWidgetType}
        onTypeSelect={handleWidgetTypeSelect}
        onContinue={handleContinueAfterTypeSelect}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <Card className="w-full">
            <CardHeader className="pb-4">
              <div className="flex flex-col space-y-1.5">
                <CardTitle>{widget ? 'Edit Widget' : 'Create New Widget'}</CardTitle>
                
                {/* Progress Indicator */}
                <ProgressIndicator 
                  steps={steps} 
                  currentStep={currentStep}
                  onStepClick={handleStepClick}
                />
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Widget Name Input */}
              <div className="mb-6">
                <FieldWithHelp
                  label="Widget Name"
                  helpText="A descriptive name to identify this widget in your dashboard"
                  id="widget-name"
                >
                  <input
                    id="widget-name"
                    type="text"
                    value={currentWidget.name}
                    onChange={(e) => setCurrentWidget({...currentWidget, name: e.target.value})}
                    className="w-full p-2 border rounded-md bg-background"
                    placeholder="Enter widget name"
                  />
                </FieldWithHelp>
              </div>
              
              {/* Enhanced Tabs Navigation */}
              <EnhancedTabsNavigation
                primaryTab={primaryTab}
                secondaryTab={secondaryTab}
                onPrimaryTabChange={setPrimaryTab}
                onSecondaryTabChange={setSecondaryTab}
                secondaryTabs={secondaryTabs}
              />
              
              {/* Tab Content */}
              <div className="mt-6">
                {primaryTab === 'design' && (
                  <EnhancedDesignTab 
                    design={currentWidget.design} 
                    onChange={handleDesignChange} 
                  />
                )}
                
                {/* Other tabs would be implemented similarly */}
                {primaryTab === 'behavior' && (
                  <div className="p-4 border rounded-lg bg-muted/20">
                    <p className="text-center text-muted-foreground">
                      Behavior tab content would go here
                    </p>
                  </div>
                )}
                
                {primaryTab === 'content' && (
                  <div className="p-4 border rounded-lg bg-muted/20">
                    <p className="text-center text-muted-foreground">
                      Content tab content would go here
                    </p>
                  </div>
                )}
                
                {primaryTab === 'integration' && (
                  <div className="p-4 border rounded-lg bg-muted/20">
                    <p className="text-center text-muted-foreground">
                      Integration tab content would go here
                    </p>
                  </div>
                )}
              </div>
              
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mt-6 p-4 border border-red-500 bg-red-50 dark:bg-red-950/20 rounded-md">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <h4 className="font-medium">Validation Errors</h4>
                  </div>
                  <ul className="list-disc pl-5 mt-2 text-red-600 dark:text-red-400 text-sm">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave}
                  disabled={!isValid}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {widget ? 'Save Changes' : 'Create Widget'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <EnhancedPreview
            widget={currentWidget as Widget}
            previewDevice={previewDevice}
            previewState={previewState}
            setPreviewDevice={setPreviewDevice}
            setPreviewState={setPreviewState}
          />
        </div>
      </div>
    </>
  );
}
