import { useState, useEffect } from "react";
import { Widget, defaultWidget } from "./widget-types";
import { EnhancedWidgetDesignConfig } from "../../types/widget/enhanced-config.types";
import { defaultChatWidget } from "./chat-widget-types";
import { VisualWidgetTypeSelector } from "./visual-widget-type-selector";
import { WidgetPreview } from "./widget-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Save, Check } from "lucide-react";
import { EnhancedDesignTab } from "./enhanced-design-tab";
import { BehaviorStep } from "@/components/widget-editor/wizard-steps/behavior-step";
import { ContentStep } from "@/components/widget-editor/wizard-steps/content-step";
import { IntegrationStep } from "@/components/widget-editor/wizard-steps/integration-step";
import { PreviewStep } from "@/components/widget-editor/wizard-steps/preview-step";

interface WidgetWizardProps {
  widget?: Widget;
  onSave: (widget: Widget) => void;
  onCancel: () => void;
}

export function WidgetWizard({ widget, onSave, onCancel }: WidgetWizardProps) {
  // State for the current step
  const [currentStep, setCurrentStep] = useState(widget ? 1 : 0);
  
  // State for widget type selection
  const [widgetTypeDialogOpen, setWidgetTypeDialogOpen] = useState(!widget);
  const [selectedWidgetType, setSelectedWidgetType] = useState<'MultiWidget'>(
    'MultiWidget'
  );
  
  // State for the current widget
  const [currentWidget, setCurrentWidget] = useState<Widget>(
    widget || defaultWidget
  );
  
  // State for step validation
  const [stepValid, setStepValid] = useState(false);
  
  // Define the steps
  const steps = [
    "Widget Type",
    "Design",
    "Behavior",
    "Content",
    "Integration",
    "Preview",
  ];
  
  // Check if we're on the last step
  const isLastStep = currentStep === steps.length - 1;
  
  // Handle widget type selection
  const handleWidgetTypeSelect = (type: string) => {
    setSelectedWidgetType('MultiWidget');
    setStepValid(true);
  };
  
  // Handle continue after widget type selection
  const handleContinueAfterTypeSelect = () => {
    setWidgetTypeDialogOpen(false);
    
    // Initialize the widget based on the selected type
    setCurrentWidget({
      ...defaultChatWidget,
      name: "New MultiWidget"
    });
    
    // Move to the next step
    setCurrentStep(1);
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setStepValid(false); // Reset validation for the new step
    }
  };
  
  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setStepValid(true); // Assume previous steps are valid
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
  
  // Update widget design
  const handleDesignChange = (enhancedDesign: EnhancedWidgetDesignConfig) => {
    setCurrentWidget(prev => ({
      ...prev,
      design: {
        theme: enhancedDesign.theme,
        position: enhancedDesign.position,
        primaryColor: enhancedDesign.colors.primary,
        secondaryColor: enhancedDesign.colors.secondary,
        borderRadius: enhancedDesign.borderRadius,
        shadow: typeof enhancedDesign.shadow === 'string' ? enhancedDesign.shadow : 'custom',
        fontFamily: enhancedDesign.fontFamily,
        animation: enhancedDesign.animation.type,
        media: enhancedDesign.media
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
  
  // Update widget chat config
  const handleChatConfigChange = (chatConfig: Widget['chatConfig']) => {
    setCurrentWidget(prev => ({
      ...prev,
      chatConfig: {
        ...prev.chatConfig,
        ...chatConfig
      }
    }));
  };
  
  // Update widget name
  const handleNameChange = (name: string) => {
    setCurrentWidget(prev => ({
      ...prev,
      name
    }));
  };
  
  // Validate current step
  useEffect(() => {
    let isValid = false;
    
    switch (currentStep) {
      case 0: // Widget Type
        isValid = true; // Always valid since we only have one type now
        break;
      case 1: // Design
        isValid = true; // Design is always valid since EnhancedDesignTab handles its own validation
        break;
      case 2: // Behavior
        isValid = currentWidget.behavior.trigger !== undefined;
        break;
      case 3: // Content
        isValid = !!currentWidget.content.title && !!currentWidget.content.ctaText;
        break;
      case 4: // Integration
        isValid = true; // Always valid since we have both booking and chat in one widget
        break;
      case 5: // Preview
        isValid = true; // Preview is always valid
        break;
      default:
        isValid = false;
    }
    
    setStepValid(isValid);
  }, [currentStep, currentWidget]);
  
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
      
      {/* Main Wizard Content */}
      {!widgetTypeDialogOpen && (
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="relative mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`
                    flex flex-col items-center cursor-pointer
                    ${index === currentStep ? 'text-primary' : 
                      index < currentStep ? 'text-muted-foreground' : 'text-muted-foreground/50'}
                  `}
                  onClick={() => {
                    // Don't reopen the widget type dialog when clicking on the first step
                    if (index === 0) {
                      // Just stay on current step if trying to go back to widget type
                      return;
                    }
                    
                    // Allow navigation to completed steps
                    if (index <= currentStep) {
                      setCurrentStep(index);
                    }
                  }}
                >
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full mb-1
                    ${index === currentStep ? 'bg-primary text-white' : 
                      index < currentStep ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground/50'}
                  `}>
                    {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className="text-xs hidden md:block">{step}</span>
                </div>
              ))}
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Step Content */}
          <Card className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Step Content */}
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {steps[currentStep]}
                </h2>
                
                {currentStep === 1 && (
                  <EnhancedDesignTab 
                    design={{
                      colors: {
                        primary: currentWidget.design.primaryColor,
                        secondary: currentWidget.design.secondaryColor,
                        text: '#333333',
                        background: '#ffffff',
                        accent: '#ff5733',
                        gradient: {
                          type: 'linear',
                          direction: '135deg',
                          colors: [currentWidget.design.primaryColor, currentWidget.design.secondaryColor]
                        }
                      },
                      position: currentWidget.design.position as any,
                      theme: currentWidget.design.theme as any,
                      borderRadius: currentWidget.design.borderRadius,
                      shadow: currentWidget.design.shadow,
                      fontFamily: currentWidget.design.fontFamily,
                      animation: {
                        type: currentWidget.design.animation as any,
                        duration: 250,
                        easing: 'ease-out'
                      },
                      launcher: {
                        size: 60,
                        shape: 'circle',
                        useGradient: true,
                        pulseAnimation: true
                      },
                      media: currentWidget.design.media
                    }}
                    onChange={handleDesignChange}
                  />
                )}
                
                {currentStep === 2 && (
                  <BehaviorStep 
                    behavior={currentWidget.behavior}
                    onChange={handleBehaviorChange}
                    onValidChange={setStepValid}
                  />
                )}
                
                {currentStep === 3 && (
                  <ContentStep 
                    content={currentWidget.content}
                    onChange={handleContentChange}
                    onValidChange={setStepValid}
                  />
                )}
                
                {currentStep === 4 && (
                  <IntegrationStep 
                    integration={currentWidget.integration}
                    widgetType={currentWidget.type}
                    onChange={handleIntegrationChange}
                    onValidChange={setStepValid}
                  />
                )}
                
                {currentStep === 5 && (
                  <PreviewStep 
                    widget={currentWidget as Widget}
                    name={currentWidget.name}
                    onNameChange={handleNameChange}
                  />
                )}
              </div>
              
              {/* Live Preview */}
              <div className="hidden lg:block">
                <h3 className="text-lg font-medium mb-4">Live Preview</h3>
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border rounded-lg h-[500px]">
                  {/* Mock website content */}
                  <div className="absolute top-0 left-0 right-0 h-12 bg-white dark:bg-gray-800 border-b flex items-center px-4">
                    <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="ml-auto flex space-x-4">
                      <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  
                  <div className="absolute top-20 left-8 right-8">
                    <div className="w-3/4 h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-600 rounded mb-6"></div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Widget Preview */}
                  <div className="absolute inset-0">
                    {currentStep === 5 ? (
                      <WidgetPreview 
                        widget={currentWidget as Widget}
                        state={currentWidget.previewState || "expanded"}
                        device="desktop"
                      />
                    ) : (
                      <WidgetPreview 
                        widget={currentWidget as Widget}
                        state="expanded"
                        device="desktop"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Navigation Buttons */}
          <div className="flex justify-start space-x-4">
            <Button 
              variant="outline" 
              onClick={currentStep === 0 ? onCancel : handlePreviousStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            
            <Button 
              onClick={isLastStep ? handleSave : handleNextStep}
              disabled={!stepValid}
              className="flex items-center gap-2"
            >
              {isLastStep ? (
                <>
                  <Save className="h-4 w-4" />
                  {widget ? 'Save Changes' : 'Create Widget'}
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
