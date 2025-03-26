import { useState, useEffect, useRef } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
}

interface SupportChatDialogProps {
  onClose: () => void;
  visible: boolean;
  adminAvailable: boolean;
}

export function SupportChatDialog({ onClose, visible, adminAvailable }: SupportChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add initial welcome message
  useEffect(() => {
    if (visible && adminAvailable && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          text: "Hi there! How can we help you today?",
          sender: "admin",
          timestamp: new Date()
        }
      ]);
    }
  }, [visible, adminAvailable, messages.length]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Show contact form if admin is not available
  useEffect(() => {
    if (visible && !adminAvailable) {
      setShowContactForm(true);
    }
  }, [visible, adminAvailable]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    setIsSubmitting(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    // Simulate admin response after a delay
    setTimeout(() => {
      const adminMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! Our team will get back to you as soon as possible.",
        sender: 'admin',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, adminMessage]);
      setIsSubmitting(false);
    }, 1500);
  };

  // Handle contact form submission
  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowContactForm(false);
      setMessages([
        {
          id: "confirmation",
          text: `Thanks for reaching out, ${contactForm.name}! We've received your message and will get back to you at ${contactForm.email} as soon as possible.`,
          sender: "admin",
          timestamp: new Date()
        }
      ]);
    }, 1500);
  };

  // Handle input change for contact form
  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 shadow-xl">
      <Card className="border-2 border-primary/10 overflow-hidden">
        <CardHeader className="bg-gray-900 text-white p-4 flex flex-row justify-between items-center">
          <div>
            <h3 className="font-semibold">Support Chat</h3>
            <p className="text-xs text-gray-300">
              {adminAvailable 
                ? "Our team is online and ready to help" 
                : "Leave us a message and we'll get back to you"}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        {showContactForm ? (
          <CardContent className="p-4">
            <form onSubmit={handleContactFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactFormChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={contactForm.email}
                    onChange={handleContactFormChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactFormChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={contactForm.message}
                    onChange={handleContactFormChange}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        ) : (
          <>
            <CardContent className="p-4 h-80 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span className="text-xs opacity-70 block mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            
            <CardFooter className="p-4 border-t">
              <div className="flex w-full items-center space-x-2">
                <Textarea
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 min-h-10 max-h-32"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
