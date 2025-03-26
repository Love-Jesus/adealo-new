import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCompanies } from "@/services/firestore";
import { Company } from "@/types/company";
import { DocumentSnapshot } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Search, RefreshCw } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
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
import { FilterBar, FilterOption } from "@/components/filter-bar";
import { VirtualizedCompanyTable } from "@/components/virtualized-company-table";
import { ErrorBoundary } from "react-error-boundary";

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <Card className="max-w-md mx-auto rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-destructive">Something went wrong</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">An error occurred while rendering the dashboard:</p>
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

export default function DashboardPage() {
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

  // Initial data load - only runs once
  useEffect(() => {
    // Only load data once on mount
    loadData(true, null);
    
    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [loadData]); // Add loadData to the dependency array


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
      // In a real implementation, you'd want to send the search query to the server
      // For now, we'll just filter client-side
    }, 300);
  };
  
  // Handle filter changes
  const handleFilterChange = (filters: FilterOption[]) => {
    setActiveFilters(filters);
    // In a real implementation, you'd want to apply these filters server-side
    // For now, we'll just reload the data
    loadData(true, null);
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

  // Filter companies client-side based on search query
  const filteredCompanies = searchQuery 
    ? companies.filter(company => 
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        company.info?.naceCategories?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.location?.municipality?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : companies;

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
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto flex items-center gap-4">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search companies..."
                className="w-full pl-8 h-9 rounded-md border border-input/50 bg-background/50 px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/30"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 bg-background w-full">
        {/* Filter bar */}
        <div className="border-b border-border/30 bg-card/50 py-4 px-4 w-full">
          <div className="w-full">
            <FilterBar 
              onFilterChange={handleFilterChange}
              onExport={() => {}}
              onSaveList={() => {}}
              totalResults={filteredCompanies.length}
            />
          </div>
        </div>

        <div className="p-6 w-full max-w-none">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin h-12 w-12 border-4 border-primary rounded-full border-t-transparent"></div>
            </div>
          ) : error ? (
            <Card className="max-w-md mx-auto rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
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
