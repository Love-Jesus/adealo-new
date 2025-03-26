import { useState, useEffect } from "react";
import { Widget } from "./widget-types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Mail, Code, ExternalLink, PartyPopper } from "lucide-react";
import ReactConfetti from "react-confetti";

interface WidgetSaveSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widget: Widget;
  onViewWidgets: () => void;
  onSendEmail?: (email: string) => void;
}

export function WidgetSaveSuccessDialog({
  open,
  onOpenChange,
  widget,
  onViewWidgets,
  onSendEmail
}: WidgetSaveSuccessDialogProps) {
  const [activeTab, setActiveTab] = useState("embed");
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  
  // Generate embed code
  const generateEmbedCode = () => {
    const widgetId = widget.id;
    
    return `<!-- Adealo Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AdealoWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    w[o].l=1*new Date();js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.async=1;js.src=f;fjs.parentNode.insertBefore(js,fjs);
  })(window,document,'script','adealo','https://widget.adealo.com/loader.js');
  adealo('init', '${widgetId}');
</script>
<!-- End Adealo Widget -->`;
  };
  
  // Copy embed code to clipboard
  const copyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Handle email send
  const handleSendEmail = () => {
    if (onSendEmail && email) {
      onSendEmail(email);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 2000);
    }
  };
  
  // State for confetti
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  // Set up confetti effect
  useEffect(() => {
    // Update window size for confetti
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {showConfetti && (
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.15}
          />
        )}
        
        <div className="py-4">
          {/* Success Message */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-500 mb-4">
              <PartyPopper className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your widget is ready to use!</h2>
            <p className="text-muted-foreground">
              You can now embed it on your website or share it with your team.
            </p>
          </div>
          
          {/* Embed Code and Email */}
          <div className="bg-background rounded-lg p-6 border shadow-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="embed" className="flex-1">
                  <Code className="h-4 w-4 mr-2" />
                  Embed Code
                </TabsTrigger>
                <TabsTrigger value="email" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Send to Team
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="embed" className="mt-0 min-h-[300px]">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Copy and paste this code into your website to display the widget.
                  </p>
                  
                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-md text-xs overflow-auto max-h-[200px] whitespace-pre-wrap break-all">
                      {generateEmbedCode()}
                    </pre>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={copyEmbedCode}
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Installation Instructions:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Copy the code above</li>
                      <li>Paste it just before the closing <code>&lt;/body&gt;</code> tag on your website</li>
                      <li>The widget will appear on your site automatically</li>
                    </ol>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="email" className="mt-0 min-h-[300px]">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Send the embed code to a team member who can add it to your website.
                  </p>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g., developer@yourcompany.com"
                        className="flex-1 p-2 border rounded-md bg-background"
                      />
                      <Button 
                        onClick={handleSendEmail}
                        disabled={!email || emailSent}
                      >
                        {emailSent ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Sent
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-1" />
                            Send
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>
                      We'll send an email with the embed code and installation instructions to the specified address.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <DialogFooter className="flex justify-start gap-4 mt-4">
          <Button 
            onClick={onViewWidgets}
            className="gap-1"
          >
            <ExternalLink className="h-4 w-4" />
            View All Widgets
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
