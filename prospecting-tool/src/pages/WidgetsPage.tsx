import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getWidgets, createWidget, updateWidget, updateWidgetStatus, deleteWidget } from "@/services/widgets";
import { auth } from "@/lib/firebase";
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
import { Plus, Settings, Calendar, Layout, Code, Search, PlusCircle, Trash2, MoreHorizontal, MessageSquare, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { WidgetWizard } from "@/components/widget-editor/widget-wizard";
import { VisualWidgetTypeSelector } from "@/components/widget-editor/visual-widget-type-selector";
import { WidgetSaveSuccessDialog } from "@/components/widget-editor/widget-save-success-dialog";
import { Widget, defaultWidget, WidgetType } from "@/components/widget-editor/widget-types";
import { defaultChatWidget } from "@/components/widget-editor/chat-widget-types";
import { WidgetEmbedDialog } from "@/components/widget-embed-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function WidgetsPage() {
  const navigate = useNavigate();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("widgets");
  const [isCreatingWidget, setIsCreatingWidget] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [widgetTypeDialogOpen, setWidgetTypeDialogOpen] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType>('MultiWidget');
  const [embedCodeWidget, setEmbedCodeWidget] = useState<Widget | null>(null);
  const [embedCodeDialogOpen, setEmbedCodeDialogOpen] = useState(false);
  const [savedWidget, setSavedWidget] = useState<Widget | null>(null);
  const [saveSuccessDialogOpen, setSaveSuccessDialogOpen] = useState(false);
  
  // Load widgets from Firestore
  useEffect(() => {
    const loadWidgets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if user is authenticated
        if (!auth.currentUser) {
          console.error("Authentication error: No user is logged in");
          setError("You must be logged in to view widgets. Please log in and try again.");
          setWidgets([]);
          return;
        }
        
        console.log("Loading widgets for user:", auth.currentUser.uid);
        const widgetsData = await getWidgets();
        console.log(`Successfully loaded ${widgetsData.length} widgets`);
        setWidgets(widgetsData);
      } catch (err: any) {
        console.error("Error loading widgets:", err);
        
        // Display more specific error messages
        if (err.message) {
          setError(err.message);
        } else {
          setError("Failed to load widgets. Please try again or create a new widget.");
        }
        
        setWidgets([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWidgets();
  }, []);

  // Filter widgets based on search query
  const filteredWidgets = searchQuery 
    ? widgets.filter(widget => 
        widget.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : widgets;

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Create new widget
  const handleCreateWidget = () => {
    setWidgetTypeDialogOpen(true);
  };
  
  // Handle widget type selection
  const handleWidgetTypeSelect = () => {
    setWidgetTypeDialogOpen(false);
    setIsCreatingWidget(true);
    setSelectedWidget(null);
  };

  // Edit existing widget
  const handleEditWidget = (widget: Widget) => {
    setSelectedWidget(widget);
    setIsCreatingWidget(true);
  };

  // Close widget editor
  const handleCloseEditor = () => {
    setIsCreatingWidget(false);
    setSelectedWidget(null);
  };
  
  // Duplicate widget
  const handleDuplicateWidget = (widget: Widget) => {
    const duplicatedWidget = {
      ...widget,
      id: undefined,
      name: `${widget.name} (Copy)`,
      status: 'draft' as const,
      createdAt: undefined,
      updatedAt: undefined,
      stats: {
        views: 0,
        interactions: 0,
        leads: 0
      }
    };
    
    setSelectedWidget(duplicatedWidget);
    setIsCreatingWidget(true);
  };

  // Widget status badge component
  const WidgetStatusBadge = ({ status }: { status: 'active' | 'inactive' | 'draft' }) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
      case 'draft':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Draft</Badge>;
      default:
        return null;
    }
  };

  // Widget card component
  const WidgetCard = ({ widget }: { widget: Widget }) => {
    // All widgets are now MultiWidget type
    return (
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{widget.name}</CardTitle>
              <CardDescription>{widget.type}</CardDescription>
            </div>
            <WidgetStatusBadge status={widget.status} />
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-3 gap-2 text-sm mb-4">
            <div className="flex flex-col items-center p-2 bg-muted/30 rounded-md">
              <span className="text-muted-foreground">Views</span>
              <span className="text-xl font-bold">{widget.stats?.views || 0}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted/30 rounded-md">
              <span className="text-muted-foreground">Interactions</span>
              <span className="text-xl font-bold">{widget.stats?.interactions || 0}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted/30 rounded-md">
              <span className="text-muted-foreground">Leads</span>
              <span className="text-xl font-bold">{widget.stats?.leads || 0}</span>
            </div>
          </div>
          
          {/* Widget preview thumbnail */}
          <div className="relative h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-md flex items-center justify-center border border-border/50 mb-2">
            <div className="absolute bottom-2 right-2 bg-card border border-border/50 rounded-md p-2 shadow-sm">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="text-center max-w-[80%]">
              <div className="text-sm font-medium">{widget.content.title}</div>
              <div className="text-xs text-muted-foreground">{widget.content.description}</div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Last updated: {widget.updatedAt ? widget.updatedAt.toLocaleDateString() : 'N/A'}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleEditWidget(widget)}
          >
            Edit
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4 mr-1" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Widget Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleDuplicateWidget(widget)}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {widget.status !== 'active' && (
                <DropdownMenuItem onClick={() => handleStatusChange(widget.id!, 'active')}>
                  Activate
                </DropdownMenuItem>
              )}
              {widget.status !== 'inactive' && (
                <DropdownMenuItem onClick={() => handleStatusChange(widget.id!, 'inactive')}>
                  Deactivate
                </DropdownMenuItem>
              )}
              {widget.status !== 'draft' && (
                <DropdownMenuItem onClick={() => handleStatusChange(widget.id!, 'draft')}>
                  Save as Draft
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {widget.status === 'active' && (
                <DropdownMenuItem onClick={() => {
                  setEmbedCodeWidget(widget as Widget);
                  setEmbedCodeDialogOpen(true);
                }}>
                  <Code className="h-4 w-4 mr-2" />
                  Get Embed Code
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                className="text-red-500"
                onClick={() => handleDeleteWidget(widget.id!)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
    );
  };

  // Handle save widget
  const handleSaveWidget = async (widget: Widget) => {
    try {
      let updatedWidget: Widget;
      
      if (selectedWidget?.id) {
        // Update existing widget
        await updateWidget({ ...widget, id: selectedWidget.id });
        
        // Update local state
        updatedWidget = { ...widget, id: selectedWidget.id };
        const updatedWidgets = widgets.map(w => 
          w.id === selectedWidget.id ? updatedWidget : w
        );
        setWidgets(updatedWidgets);
        
        console.log("Widget updated successfully");
      } else {
        // Create new widget
        const widgetId = await createWidget(widget);
        
        // Update local state
        updatedWidget = {
          ...widget,
          id: widgetId,
        };
        setWidgets([...widgets, updatedWidget]);
        
        console.log("Widget created successfully");
      }
      
      // Show success dialog with embed code
      setSavedWidget(updatedWidget as Widget);
      setSaveSuccessDialogOpen(true);
      
      setIsCreatingWidget(false);
      setSelectedWidget(null);
    } catch (err) {
      console.error("Error saving widget:", err);
      setError("Failed to save widget. Please try again.");
    }
  };
  
  // Handle delete widget
  const handleDeleteWidget = async (widgetId: string) => {
    if (!confirm("Are you sure you want to delete this widget?")) {
      return;
    }
    
    try {
      await deleteWidget(widgetId);
      
      // Update local state
      setWidgets(widgets.filter(w => w.id !== widgetId));
      
      console.log("Widget deleted successfully");
    } catch (err) {
      console.error("Error deleting widget:", err);
      setError("Failed to delete widget. Please try again.");
    }
  };
  
  // Handle widget status change
  const handleStatusChange = async (widgetId: string, status: 'active' | 'inactive' | 'draft') => {
    try {
      await updateWidgetStatus(widgetId, status);
      
      // Find the widget
      const widget = widgets.find(w => w.id === widgetId);
      
      if (!widget) {
        throw new Error(`Widget with ID ${widgetId} not found`);
      }
      
      // Update local state
      const updatedWidget = { ...widget, status };
      const updatedWidgets = widgets.map(w => 
        w.id === widgetId ? updatedWidget : w
      );
      setWidgets(updatedWidgets);
      
      console.log(`Widget ${status === 'active' ? 'activated' : status === 'inactive' ? 'deactivated' : 'saved as draft'}`);
      
      // Show success dialog with embed code if widget is activated
      if (status === 'active') {
        setSavedWidget(updatedWidget as Widget);
        setSaveSuccessDialogOpen(true);
      }
    } catch (err) {
      console.error("Error updating widget status:", err);
      setError("Failed to update widget status. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with breadcrumb */}
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
                <BreadcrumbPage>Widgets</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search widgets..."
                className="w-full pl-8 h-9 rounded-md border border-input/50 bg-background/50 px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/30"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Widget Embed Code Dialog */}
      {embedCodeWidget && (
        <WidgetEmbedDialog
          widgetId={embedCodeWidget.id!}
          widgetName={embedCodeWidget.name}
          primaryColor={embedCodeWidget.design.primaryColor}
          secondaryColor={embedCodeWidget.design.secondaryColor}
          position={embedCodeWidget.design.position as any}
          title={embedCodeWidget.content.title}
          description={embedCodeWidget.content.description}
          ctaText={embedCodeWidget.content.ctaText}
          calendlyUrl={embedCodeWidget.integration.calendlyUrl}
          open={embedCodeDialogOpen}
          onOpenChange={setEmbedCodeDialogOpen}
        />
      )}
      
      {/* Widget Type Selection Dialog */}
      <VisualWidgetTypeSelector
        open={widgetTypeDialogOpen}
        onOpenChange={setWidgetTypeDialogOpen}
        selectedType={selectedWidgetType}
        onTypeSelect={(type) => setSelectedWidgetType(type)}
        onContinue={handleWidgetTypeSelect}
      />
      
      {/* Widget Save Success Dialog */}
      {savedWidget && (
        <WidgetSaveSuccessDialog
          widget={savedWidget}
          open={saveSuccessDialogOpen}
          onOpenChange={setSaveSuccessDialogOpen}
          onViewWidgets={() => {
            setSaveSuccessDialogOpen(false);
            setIsCreatingWidget(false);
          }}
          onSendEmail={(email) => {
            console.log(`Sending embed code to: ${email}`);
            // In a real implementation, this would call an API to send the email
          }}
        />
      )}

      {/* Main content */}
      <main className="flex-1 bg-background w-full">
        {isCreatingWidget ? (
          <div className="p-6">
            <WidgetWizard 
              widget={selectedWidget || defaultWidget}
              onSave={handleSaveWidget}
              onCancel={handleCloseEditor}
            />
          </div>
        ) : (
          <>
            {/* Page header */}
            <div className="border-b border-border/30 bg-card/50 py-4 px-6 w-full">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">Widgets</h1>
                  <p className="text-muted-foreground">
                    Create and manage widgets for your website
                  </p>
                </div>
                <Button onClick={handleCreateWidget}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Widget
                </Button>
              </div>
            </div>

            {/* Widgets grid */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500">
                  {error}
                </div>
              )}
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="widgets">All Widgets</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  <TabsTrigger value="drafts">Drafts</TabsTrigger>
                </TabsList>
                
                <TabsContent value="widgets" className="mt-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
                    </div>
                  ) : filteredWidgets.length === 0 ? (
                    <Card className="w-full p-8 flex flex-col items-center justify-center">
                      <div className="rounded-full bg-muted/50 p-4 mb-4">
                        <Calendar className="h-8 w-8 text-muted-foreground/70" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">No widgets found</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-4">
                        Create your first widget to start collecting leads from your website visitors.
                      </p>
                      <Button onClick={handleCreateWidget}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Widget
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredWidgets.map(widget => (
                        <WidgetCard key={widget.id} widget={widget} />
                      ))}
                      
                      {/* Add new widget card */}
                      <Card 
                        className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={handleCreateWidget}
                      >
                        <div className="rounded-full bg-muted/50 p-4 mb-4">
                          <Plus className="h-6 w-6 text-muted-foreground/70" />
                        </div>
                        <h3 className="font-medium mb-1">Create New Widget</h3>
                        <p className="text-sm text-muted-foreground text-center">
                          Add a new widget to your collection
                        </p>
                      </Card>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="active" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredWidgets
                      .filter(widget => widget.status === 'active')
                      .map(widget => (
                        <WidgetCard key={widget.id} widget={widget} />
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="inactive" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredWidgets
                      .filter(widget => widget.status === 'inactive')
                      .map(widget => (
                        <WidgetCard key={widget.id} widget={widget} />
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="drafts" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredWidgets
                      .filter(widget => widget.status === 'draft')
                      .map(widget => (
                        <WidgetCard key={widget.id} widget={widget} />
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
