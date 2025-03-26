import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  markMessagesAsRead,
  updateConversationStatus,
  assignConversation,
  addTagsToConversation,
  removeTagFromConversation,
  processWithClaude,
  toggleAI,
  ChatConversation,
  ChatMessage
} from "@/services/chat";
import { auth } from "@/lib/firebase";
import { DocumentSnapshot } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Search, 
  MessageSquare, 
  User, 
  Clock, 
  Tag, 
  MoreHorizontal, 
  Send, 
  Paperclip,
  Bot,
  CheckCircle,
  XCircle,
  Archive,
  UserPlus,
  Plus,
  X,
  RefreshCw
} from "lucide-react";

export default function ChatDashboardPage() {
  const navigate = useNavigate();
  
  // State
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'active' | 'closed' | 'archived'>('active');
  const [newTag, setNewTag] = useState("");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiProcessing, setAiProcessing] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Load conversations
  useEffect(() => {
    loadConversations(true);
  }, [activeTab]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      markMessagesAsRead(selectedConversation.id).catch(console.error);
      setAiEnabled(selectedConversation.aiEnabled);
    }
  }, [selectedConversation]);
  
  // Load conversations
  const loadConversations = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }
      
      const result = await getConversations(
        activeTab,
        20,
        isInitialLoad ? undefined : lastDoc || undefined
      );
      
      if (isInitialLoad) {
        setConversations(result.items);
        
        // Select the first conversation if none is selected
        if (result.items.length > 0 && !selectedConversation) {
          setSelectedConversation(result.items[0]);
          loadMessages(result.items[0].id);
        }
      } else {
        setConversations(prev => [...prev, ...result.items]);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      setError(null);
      
      const result = await getMessages(conversationId);
      setMessages(result.items);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };
  
  // Handle conversation selection
  const handleSelectConversation = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;
    
    try {
      await sendMessage(
        selectedConversation.id,
        newMessage,
        isInternal,
        selectedFiles
      );
      
      // Clear input
      setNewMessage("");
      setIsInternal(false);
      setSelectedFiles([]);
      
      // Reload messages
      loadMessages(selectedConversation.id);
      
      // Process with Claude if not internal and AI is enabled
      if (!isInternal && selectedConversation.aiEnabled) {
        handleProcessWithClaude();
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };
  
  // Handle file removal
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle conversation status update
  const handleStatusChange = async (status: 'active' | 'closed' | 'archived') => {
    if (!selectedConversation) return;
    
    try {
      await updateConversationStatus(selectedConversation.id, status);
      
      // Update local state
      setSelectedConversation(prev => prev ? { ...prev, status } : null);
      
      // Reload conversations if status changed to match active tab
      if (status === activeTab) {
        loadConversations(true);
      } else {
        // Remove from current list if status doesn't match active tab
        setConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
        
        // Select another conversation if available
        if (conversations.length > 1) {
          const nextConversation = conversations.find(c => c.id !== selectedConversation.id);
          if (nextConversation) {
            setSelectedConversation(nextConversation);
            loadMessages(nextConversation.id);
          } else {
            setSelectedConversation(null);
            setMessages([]);
          }
        } else {
          setSelectedConversation(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Error updating conversation status:", err);
      setError(err instanceof Error ? err.message : "Failed to update conversation status");
    }
  };
  
  // Handle adding a tag
  const handleAddTag = async () => {
    if (!selectedConversation || !newTag.trim()) return;
    
    try {
      await addTagsToConversation(selectedConversation.id, [newTag]);
      
      // Update local state
      setSelectedConversation(prev => {
        if (!prev) return null;
        
        const tags = [...(prev.tags || [])];
        if (!tags.includes(newTag)) {
          tags.push(newTag);
        }
        
        return { ...prev, tags };
      });
      
      // Clear input
      setNewTag("");
    } catch (err) {
      console.error("Error adding tag:", err);
      setError(err instanceof Error ? err.message : "Failed to add tag");
    }
  };
  
  // Handle removing a tag
  const handleRemoveTag = async (tag: string) => {
    if (!selectedConversation) return;
    
    try {
      await removeTagFromConversation(selectedConversation.id, tag);
      
      // Update local state
      setSelectedConversation(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          tags: (prev.tags || []).filter(t => t !== tag)
        };
      });
    } catch (err) {
      console.error("Error removing tag:", err);
      setError(err instanceof Error ? err.message : "Failed to remove tag");
    }
  };
  
  // Handle assigning conversation
  const handleAssignConversation = async (agentId: string, agentName: string) => {
    if (!selectedConversation) return;
    
    try {
      await assignConversation(selectedConversation.id, agentId, agentName);
      
      // Update local state
      setSelectedConversation(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          assignedTo: agentId,
          assignedToName: agentName
        };
      });
    } catch (err) {
      console.error("Error assigning conversation:", err);
      setError(err instanceof Error ? err.message : "Failed to assign conversation");
    }
  };
  
  // Handle toggling AI
  const handleToggleAI = async (enabled: boolean) => {
    if (!selectedConversation) return;
    
    try {
      await toggleAI(selectedConversation.id, enabled);
      
      // Update local state
      setSelectedConversation(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          aiEnabled: enabled
        };
      });
      
      setAiEnabled(enabled);
    } catch (err) {
      console.error("Error toggling AI:", err);
      setError(err instanceof Error ? err.message : "Failed to toggle AI");
    }
  };
  
  // Handle processing with Claude
  const handleProcessWithClaude = async () => {
    if (!selectedConversation || !aiEnabled) return;
    
    try {
      setAiProcessing(true);
      
      // Get the last user message
      const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
      
      if (!lastUserMessage) return;
      
      await processWithClaude(
        selectedConversation.id,
        lastUserMessage.text,
        messages
      );
      
      // Reload messages
      loadMessages(selectedConversation.id);
    } catch (err) {
      console.error("Error processing with Claude:", err);
      setError(err instanceof Error ? err.message : "Failed to process with Claude");
    } finally {
      setAiProcessing(false);
    }
  };
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Check if a message is from the same sender as the previous one
  const isSameSender = (message: ChatMessage, index: number) => {
    if (index === 0) return false;
    
    const prevMessage = messages[index - 1];
    return (
      message.sender === prevMessage.sender &&
      message.senderId === prevMessage.senderId &&
      !message.isInternal &&
      !prevMessage.isInternal &&
      // Messages within 5 minutes are grouped
      message.timestamp.getTime() - prevMessage.timestamp.getTime() < 5 * 60 * 1000
    );
  };
  
  // Render conversation list item
  const ConversationListItem = ({ conversation }: { conversation: ChatConversation }) => {
    const isSelected = selectedConversation?.id === conversation.id;
    
    return (
      <div
        className={`p-3 border-b cursor-pointer transition-colors ${
          isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
        }`}
        onClick={() => handleSelectConversation(conversation)}
      >
        <div className="flex justify-between items-start mb-1">
          <div className="font-medium truncate">
            {conversation.visitor.name || 'Anonymous Visitor'}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDate(conversation.lastMessageAt)}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground truncate mb-2">
          {conversation.lastMessage || 'No messages yet'}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {conversation.status === 'active' && (
              <Badge variant="default" className="bg-green-500">Active</Badge>
            )}
            {conversation.status === 'closed' && (
              <Badge variant="outline">Closed</Badge>
            )}
            {conversation.status === 'archived' && (
              <Badge variant="outline" className="text-muted-foreground">Archived</Badge>
            )}
            
            {conversation.aiEnabled && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                AI Enabled
              </Badge>
            )}
          </div>
          
          {conversation.assignedToName && (
            <div className="text-xs flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{conversation.assignedToName}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/30 bg-card shadow-sm z-10">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Chat Support</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search conversations..."
                className="w-full pl-8 h-9 rounded-md border border-input/50 bg-background/50 px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation list */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-red-500">{error}</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations found
              </div>
            ) : (
              <>
                {conversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                  />
                ))}
                
                {hasMore && (
                  <div className="p-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadConversations(false)}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                      ) : (
                        'Load more'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedConversation.visitor.name || 'Anonymous Visitor'}
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {selectedConversation.visitor.email && (
                      <span className="mr-3">{selectedConversation.visitor.email}</span>
                    )}
                    {selectedConversation.visitor.company && (
                      <span>{selectedConversation.visitor.company}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 mr-2">
                    <Label htmlFor="ai-toggle" className="text-sm">AI Assistant</Label>
                    <Switch
                      id="ai-toggle"
                      checked={aiEnabled}
                      onCheckedChange={handleToggleAI}
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Conversation Actions</DropdownMenuLabel>
                      
                      {selectedConversation.status === 'active' && (
                        <DropdownMenuItem onClick={() => handleStatusChange('closed')}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Resolved
                        </DropdownMenuItem>
                      )}
                      
                      {selectedConversation.status === 'closed' && (
                        <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reopen Conversation
                        </DropdownMenuItem>
                      )}
                      
                      {(selectedConversation.status === 'active' || selectedConversation.status === 'closed') && (
                        <DropdownMenuItem onClick={() => handleStatusChange('archived')}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive Conversation
                        </DropdownMenuItem>
                      )}
                      
                      {selectedConversation.status === 'archived' && (
                        <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Unarchive Conversation
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign Conversation
                      </DropdownMenuItem>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Tag className="h-4 w-4 mr-2" />
                            Manage Tags
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manage Tags</DialogTitle>
                            <DialogDescription>
                              Add or remove tags for this conversation
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="flex gap-2 flex-wrap">
                              {selectedConversation.tags?.map((tag) => (
                                <Badge key={tag} className="flex items-center gap-1">
                                  {tag}
                                  <button
                                    className="ml-1 hover:text-destructive"
                                    onClick={() => handleRemoveTag(tag)}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                              
                              {(!selectedConversation.tags || selectedConversation.tags.length === 0) && (
                                <div className="text-sm text-muted-foreground">
                                  No tags added yet
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add new tag..."
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddTag();
                                  }
                                }}
                              />
                              <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline">Close</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    No messages yet
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <div key={message.id} className={`${message.isInternal ? 'pl-8' : ''}`}>
                        {/* Date separator */}
                        {index === 0 || formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp) ? (
                          <div className="flex justify-center my-4">
                            <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                              {formatDate(message.timestamp)}
                            </div>
                          </div>
                        ) : null}
                        
                        {/* Message */}
                        <div className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'} ${isSameSender(message, index) ? 'mt-1' : 'mt-4'}`}>
                          {/* Avatar for user/visitor */}
                          {message.sender === 'user' && !isSameSender(message, index) && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          
                          <div className={`max-w-[80%] ${message.isInternal ? 'w-full border border-yellow-500 bg-yellow-50 p-3 rounded-lg' : ''}`}>
                            {/* Sender name */}
                            {!isSameSender(message, index) && !message.isInternal && (
                              <div className="text-xs font-medium mb-1 flex items-center gap-2">
                                {message.sender === 'user' ? (
                                  selectedConversation.visitor.name || 'Visitor'
                                ) : message.sender === 'ai' ? (
                                  <div className="flex items-center gap-1">
                                    <Bot className="h-3 w-3" />
                                    <span>AI Assistant</span>
                                  </div>
                                ) : (
                                  message.senderName || 'Support Agent'
                                )}
                                <span className="text-muted-foreground">
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                            )}
                            
                            {/* Internal note label */}
                            {message.isInternal && (
                              <div className="text-xs font-medium mb-1 text-yellow-700 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <span>Internal Note</span>
                                  <span>•</span>
                                  <span>{message.senderName || 'Support Agent'}</span>
                                </div>
                                <span className="text-muted-foreground">
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                            )}
                            
                            {/* Message content */}
                            <div 
                              className={`${
                                message.isInternal 
                                  ? '' 
                                  : message.sender === 'user'
                                    ? 'bg-muted p-3 rounded-lg'
                                    : message.sender === 'ai'
                                      ? 'bg-blue-50 border border-blue-100 p-3 rounded-lg'
                                      : 'bg-primary text-primary-foreground p-3 rounded-lg'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{message.text}</p>
                              
                              {/* Attachments */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.attachments.map((attachment, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <Paperclip className="h-3 w-3" />
                                      <a 
                                        href={attachment.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm underline"
                                      >
                                        {attachment.name}
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* Time for grouped messages */}
                            {isSameSender(message, index) && (
                              <div className="text-xs text-muted-foreground mt-1 text-right">
                                {formatTime(message.timestamp)}
                              </div>
                            )}
                          </div>
                          
                          {/* Avatar for agent */}
                          {message.sender !== 'user' && !message.isInternal && !isSameSender(message, index) && (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center ml-2 flex-shrink-0"
                              style={{
                                backgroundColor: message.sender === 'ai' ? '#6366f1' : '#3A36DB',
                                color: '#FFFFFF',
                              }}
                            >
                              {message.sender === 'ai' ? (
                                <Bot className="h-4 w-4" />
                              ) : (
                                <User className="h-4 w-4" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* AI processing indicator */}
                    {aiProcessing && (
                      <div className="flex justify-start mt-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="max-w-[80%]">
                          <div className="text-xs font-medium mb-1 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Bot className="h-3 w-3" />
                              <span>AI Assistant</span>
                            </div>
                          </div>
                          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="animate-pulse flex space-x-1">
                                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                              </div>
                              <span className="text-sm text-blue-600">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
              
              {/* Message input */}
              <div className="p-4 border-t">
                {/* Selected files */}
                {selectedFiles.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">
                        <Paperclip className="h-3 w-3" />
                        <span className="max-w-[150px] truncate">{file.name}</span>
                        <button
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Internal note toggle */}
                <div className="flex items-center mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="internal-note"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="internal-note" className="text-sm">
                      Internal note (not visible to visitor)
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                  />
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach files"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isInternal ? "Add an internal note..." : "Type your message..."}
                    className="flex-1 min-h-[80px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="self-end"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                <p className="text-muted-foreground max-w-md">
                  Select a conversation from the list to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
