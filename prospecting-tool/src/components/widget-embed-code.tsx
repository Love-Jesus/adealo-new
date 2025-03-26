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
import { Code, Copy, Check, ExternalLink } from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

interface WidgetEmbedCodeProps {
  widgetId: string;
  widgetName: string;
  onClose?: () => void;
  onError?: () => void;
}

export function WidgetEmbedCode({ widgetId, widgetName, onClose, onError }: WidgetEmbedCodeProps) {
  const [embedCode, setEmbedCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchEmbedCode = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Fetching embed code for widget ID: ${widgetId}`);
        
        // Call the Firebase function
        const getWidgetScript = httpsCallable(functions, 'getWidgetScript');
        
        // Call the function to get the widget script
        const result = await getWidgetScript({ widgetId });
        const data = result.data as { script: string };
        
        if (!data || !data.script) {
          console.error("No script returned from Firebase function");
          setError("Failed to generate embed code: No script returned from server");
          return;
        }
        
        console.log("Successfully received widget script");
        setEmbedCode(data.script);
      } catch (err: any) {
        console.error("Error fetching widget embed code:", err);
        
        // Extract the error message from the Firebase error
        let errorMessage = "Failed to generate embed code. Please try again.";
        
        if (err.code === 'functions/failed-precondition') {
          errorMessage = "Widget must be active to generate embed code. Please activate the widget first.";
        } else if (err.code === 'functions/not-found') {
          errorMessage = "Widget not found. Please check if the widget exists.";
        } else if (err.code === 'functions/invalid-argument') {
          errorMessage = "Invalid widget ID. Please check the widget ID.";
        } else if (err.message) {
          // If there's a specific error message, use it
          errorMessage = `Error: ${err.message}`;
        }
        
        setError(errorMessage);
        
        // Call onError callback if provided
        if (onError) {
          onError();
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (widgetId) {
      fetchEmbedCode();
    }
  }, [widgetId]);

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
          <CardTitle>Widget Embed Code</CardTitle>
        </div>
        <CardDescription>
          Copy this code and paste it into your website to display the "{widgetName}" widget
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-500">
              {error}
            </div>
            
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <h3 className="text-sm font-medium mb-2">Troubleshooting Steps:</h3>
              <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                <li>Make sure the widget is set to <strong>Active</strong> status</li>
                <li>Check that all required widget fields are filled out correctly</li>
                <li>Verify that your Firebase functions are properly deployed</li>
                <li>Try refreshing the page and generating the embed code again</li>
              </ol>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsLoading(true);
                  setError(null);
                  setTimeout(() => {
                    const fetchEmbedCode = async () => {
                      try {
                        console.log(`Retrying fetch embed code for widget ID: ${widgetId}`);
                        
                        // Call the Firebase function
                        const getWidgetScript = httpsCallable(functions, 'getWidgetScript');
                        
                        // Call the function to get the widget script
                        const result = await getWidgetScript({ widgetId });
                        const data = result.data as { script: string };
                        
                        if (!data || !data.script) {
                          console.error("No script returned from Firebase function");
                          setError("Failed to generate embed code: No script returned from server");
                          return;
                        }
                        
                        console.log("Successfully received widget script");
                        setEmbedCode(data.script);
                      } catch (err: any) {
                        console.error("Error fetching widget embed code:", err);
                        
                        // Extract the error message from the Firebase error
                        let errorMessage = "Failed to generate embed code. Please try again.";
                        
                        if (err.code === 'functions/failed-precondition') {
                          errorMessage = "Widget must be active to generate embed code. Please activate the widget first.";
                        } else if (err.code === 'functions/not-found') {
                          errorMessage = "Widget not found. Please check if the widget exists.";
                        } else if (err.code === 'functions/invalid-argument') {
                          errorMessage = "Invalid widget ID. Please check the widget ID.";
                        } else if (err.message) {
                          // If there's a specific error message, use it
                          errorMessage = `Error: ${err.message}`;
                        }
                        
                        setError(errorMessage);
                        
                        // Call onError callback if provided
                        if (onError) {
                          onError();
                        }
                      } finally {
                        setIsLoading(false);
                      }
                    };
                    
                    fetchEmbedCode();
                  }, 500);
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Instructions:</h3>
              <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                <li>Copy the code below</li>
                <li>Paste it just before the closing <code className="bg-muted px-1 py-0.5 rounded">&lt;/body&gt;</code> tag in your HTML</li>
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
                  Make sure your widget is <strong>Active</strong> for it to appear on your website. 
                  You can change the widget status from the Widgets page.
                </span>
              </p>
            </div>
          </>
        )}
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
