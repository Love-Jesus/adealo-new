import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCompanies, searchCompanies, PaginatedResult } from "@/services/firestore";
import { saveList, getSavedLists, updateSavedList, deleteSavedList, SavedList } from "@/services/savedLists";
import { Company } from "@/types/company";
import { DocumentSnapshot, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Search, RefreshCw, Trash2, Save, Download, Plus, Filter } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
// Breadcrumb components removed
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar, FilterOption } from "@/components/filter-bar";
import { VirtualizedCompanyTable } from "@/components/virtualized-company-table";
import { ErrorBoundary } from "react-error-boundary";

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <Card className="max-w-md mx-auto rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-red-500">Something went wrong</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">An error occurred while rendering the prospecting page:</p>
        <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-[200px]">
          {error.message}
        </pre>
      </CardContent>
      <CardFooter>
        <Button onClick={resetErrorBoundary}>Try Again</Button>
      </CardFooter>
    </Card>
  );
}

export default function ProspectingPage() {
  const navigate = useNavigate();
  
  // State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [loadingSavedLists, setLoadingSavedLists] = useState(false);
  const [activeTab, setActiveTab] = useState("companies");
  const [showSaveListDialog, setShowSaveListDialog] = useState(false);
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  
  // Constants
  const pageSize = 20; // Number of items to load per page
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load data with pagination - stabilized to prevent infinite loops
  const loadData = useCallback(async (isInitialLoad = false, lastDocSnapshot: DocumentSnapshot | null = null) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }
      
      console.log(`Loading ${isInitialLoad ? 'initial' : 'more'} data...`);
      
      // Get companies with pagination
      const result = await getCompanies(
        pageSize, 
        isInitialLoad ? null : lastDocSnapshot
      );
      
      console.log(`Loaded ${result.items.length} companies`);
      
      if (isInitialLoad) {
        setCompanies(result.items);
      } else {
        setCompanies(prev => [...prev, ...result.items]);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError(err instanceof Error ? err.message : "Failed to load companies");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pageSize]); // Remove lastDoc from dependencies
  
  // Load saved lists
  const loadSavedLists = useCallback(async () => {
    try {
      setLoadingSavedLists(true);
      const lists = await getSavedLists();
      setSavedLists(lists);
    } catch (err) {
      console.error("Error loading saved lists:", err);
      // Don't set error state here to avoid disrupting the main UI
    } finally {
      setLoadingSavedLists(false);
    }
  }, []);

  // Initial data load - only runs once
  useEffect(() => {
    // Only load data once on mount
    loadData(true, null);
    loadSavedLists();
    
    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [loadData, loadSavedLists]); // Add loadData and loadSavedLists to the dependency array


  // Handle search input with debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set a new timeout for debouncing
    searchTimeoutRef.current = setTimeout(() => {
      // Use the enhanced search function with fuzzy matching
      if (query.trim()) {
        setLoading(true);
        searchCompanies(query, pageSize)
          .then((result: PaginatedResult<Company>) => {
            setCompanies(result.items);
            setLastDoc(result.lastDoc);
            setHasMore(result.hasMore);
            setLoading(false);
          })
          .catch((err: unknown) => {
            console.error("Error searching companies:", err);
            setError(err instanceof Error ? err.message : "Failed to search companies");
            setLoading(false);
          });
      } else {
        // If search query is empty, load regular data
        loadData(true, null);
      }
    }, 300);
  };
  
  // Handle filter changes
  const handleFilterChange = (filters: FilterOption[]) => {
    setActiveFilters(filters);
    // In a real implementation, you'd want to apply these filters server-side
    // For now, we'll just reload the data
    loadData(true, null);
  };
  
  // Handle save list
  const handleSaveList = async () => {
    if (!listName.trim()) {
      alert("Please enter a list name");
      return;
    }
    
    try {
      await saveList(
        listName,
        listDescription,
        selectedCompanies,
        activeFilters
      );
      
      // Reset form
      setListName("");
      setListDescription("");
      setShowSaveListDialog(false);
      
      // Reload saved lists
      await loadSavedLists();
      
      // Switch to saved lists tab
      setActiveTab("saved-lists");
    } catch (err) {
      console.error("Error saving list:", err);
      alert("Failed to save list. Please try again.");
    }
  };
  
  // Handle delete list
  const handleDeleteList = async (listId: string) => {
    if (!confirm("Are you sure you want to delete this list?")) {
      return;
    }
    
    try {
      await deleteSavedList(listId);
      await loadSavedLists();
    } catch (err) {
      console.error("Error deleting list:", err);
      alert("Failed to delete list. Please try again.");
    }
  };
  
  // Handle selecting multiple companies
  const handleSelectCompanies = (companyIds: string[]) => {
    setSelectedCompanies(companyIds);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Use companies directly from state since we're now using server-side search
  const filteredCompanies = companies;

  // Reset error boundary
  const handleErrorReset = () => {
    setError(null);
    loadData(true, null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Simplified header */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/30 bg-card shadow-sm z-10">
        <div className="flex items-center gap-3 px-4 w-full">
          {/* SidebarTrigger removed - now inside the sidebar */}
          
          {/* Selection counter - only shows when companies are selected */}
          {selectedCompanies.length > 0 && (
            <div className="bg-primary/10 text-primary rounded-full px-3 py-1.5 text-sm flex items-center">
              <span className="font-medium">{selectedCompanies.length} companies selected</span>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 bg-background w-full">
        {/* Main content area - removed duplicate title */}
        <div className="border-b border-border/30 bg-card/50 py-4 px-4 w-full">
          <Tabs defaultValue="companies" className="mt-2">
            <TabsList className="gap-6 bg-transparent p-0">
              <TabsTrigger value="companies" className="px-4">Companies</TabsTrigger>
              <TabsTrigger value="saved-lists" className="px-4">Saved Lists</TabsTrigger>
              <TabsTrigger value="recent-searches" className="px-4">Recent Searches</TabsTrigger>
            </TabsList>
            
            <TabsContent value="companies" className="mt-4">
              {/* Controls bar - moved under tabs */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => {
                      // Open filter dialog or dropdown
                      // This would be implemented in a real app
                      alert("This would open the filter dialog");
                    }}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                </div>
                
                <div className="flex-1 mx-4">
                  {/* Empty space for layout balance */}
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Export button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 bg-background border-border/50 hover:bg-accent/20 transition-colors"
                  >
                    <Download className="h-4 w-4 text-primary/80" />
                    <span>Export</span>
                  </Button>
                  
                  {/* Save List button */}
                  {selectedCompanies.length > 0 ? (
                    <Button 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      onClick={() => setShowSaveListDialog(true)}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save List ({selectedCompanies.length})
                    </Button>
                  ) : (
                    <Button 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 opacity-50"
                      disabled
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save List
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  {filteredCompanies.length} results
                </div>
                
                {/* Search bar moved to results line */}
                <div className="relative w-96">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search companies by name, industry, location..."
                    className="w-full pl-8 h-9 rounded-md border border-input/50 bg-background/50 px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/30"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="saved-lists" className="mt-4">
              {loadingSavedLists ? (
                <div className="flex justify-center p-6">
                  <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
                </div>
              ) : savedLists.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Lists</CardTitle>
                    <CardDescription>Your saved company lists will appear here</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">No saved lists yet. Save a list from the Companies tab.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Your Saved Lists</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => loadSavedLists()}
                    >
                      Refresh
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedLists.map(list => (
                      <Card key={list.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle>{list.name}</CardTitle>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-muted-foreground"
                              onClick={() => handleDeleteList(list.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <CardDescription>
                            {list.description || 'No description'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Companies: {list.companyIds.length}</span>
                            <span className="text-muted-foreground">
                              {list.updatedAt.toDate().toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2 flex justify-between">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              // Load companies from this list
                              // This would be implemented in a real app
                              alert("This would load the companies from this list");
                            }}
                          >
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Edit this list
                              // This would be implemented in a real app
                              alert("This would allow you to edit this list");
                            }}
                          >
                            Edit
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recent-searches" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Searches</CardTitle>
                  <CardDescription>Your recent search history will appear here</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No recent searches yet. Start searching for companies.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Save List Dialog */}
        {showSaveListDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Save List</CardTitle>
                <CardDescription>
                  Save your selected companies as a list for future reference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="list-name" className="text-sm font-medium">
                      List Name
                    </label>
                    <input
                      id="list-name"
                      type="text"
                      className="w-full p-2 rounded-md border border-input bg-background"
                      placeholder="Enter list name"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="list-description" className="text-sm font-medium">
                      Description (optional)
                    </label>
                    <textarea
                      id="list-description"
                      className="w-full p-2 rounded-md border border-input bg-background"
                      placeholder="Enter description"
                      rows={3}
                      value={listDescription}
                      onChange={(e) => setListDescription(e.target.value)}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedCompanies.length} companies selected
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSaveListDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveList}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  Save List
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        <div className="p-6 w-full max-w-none">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin h-12 w-12 border-4 border-primary rounded-full border-t-transparent"></div>
            </div>
          ) : error ? (
            <Card className="max-w-md mx-auto rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-red-500">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => loadData(true, null)}>Try Again</Button>
                <Button 
                  variant="outline" 
                  className="ml-2" 
                  onClick={() => navigate("/admin")}
                >
                  Go to Admin
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onReset={handleErrorReset}
            >
              <VirtualizedCompanyTable 
                companies={filteredCompanies}
                onSelectCompany={() => {}} // No longer needed, handled by expandable rows
                onSelectCompanies={handleSelectCompanies}
                onLoadMore={() => loadData(false, lastDoc)}
                hasMore={hasMore}
                loadingMore={loadingMore}
              />
            </ErrorBoundary>
          )}
        </div>
      </main>

    </div>
  );
}
