// src/pages/LeadDashboardPage.tsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where, 
  startAfter, 
  DocumentSnapshot,
  Timestamp,
  getDoc,
  doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getIPInfo, matchIPInfoToCompany } from "@/services/ipinfo";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  RefreshCw, 
  Building, 
  Globe, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Copy,
  ExternalLink,
  Filter,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  Info,
  Code,
  X
} from "lucide-react";
import { Company } from "@/types/company";

// Lead interface
interface Lead {
  id: string;
  ip: string;
  timestamp: Timestamp;
  companyId?: string;
  companyName?: string;
  country?: string;
  region?: string;
  city?: string;
  url?: string;
  path?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  sessionId: string;
  clientId: string;
  siteId: string;
  eventType: 'pageview' | 'engagement' | 'conversion';
  score?: number;
  ipInfo?: any;
  matchedCompany?: Company;
}

// Session interface
interface Session {
  id: string;
  clientId: string;
  siteId: string;
  ip: string;
  startTime: Timestamp;
  lastActivity: Timestamp;
  pageviews: number;
  events: {
    type: string;
    timestamp: Timestamp;
    path: string;
  }[];
  companyId?: string;
  companyName?: string;
}

// Site interface
interface Site {
  id: string;
  name: string;
  domain: string;
  createdAt: Timestamp;
  trackingEnabled: boolean;
}

export default function LeadDashboardPage() {
  const navigate = useNavigate();
  
  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeadSessions, setSelectedLeadSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [sortBy, setSortBy] = useState<string>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState("leads");
  const [showScriptInstructions, setShowScriptInstructions] = useState(false);
  
  // Constants
  const pageSize = 20; // Number of items to load per page
  
  // Calculate lead score based on various factors
  const calculateLeadScore = (lead: Lead, sessions: Session[]): number => {
    let score = 0;
    
    // Base score for company identification
    if (lead.companyId) score += 20;
    
    // Score based on sessions
    if (sessions.length > 0) {
      // Total pageviews across all sessions
      const totalPageviews = sessions.reduce((sum, session) => sum + session.pageviews, 0);
      score += Math.min(totalPageviews * 2, 30); // Max 30 points for pageviews
      
      // Session recency (higher score for recent sessions)
      const mostRecentSession = sessions.reduce((latest, session) => 
        session.lastActivity.toMillis() > latest.lastActivity.toMillis() ? session : latest, 
        sessions[0]
      );
      
      const daysSinceLastActivity = (Date.now() - mostRecentSession.lastActivity.toMillis()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastActivity < 1) score += 20;
      else if (daysSinceLastActivity < 3) score += 15;
      else if (daysSinceLastActivity < 7) score += 10;
      else if (daysSinceLastActivity < 14) score += 5;
      
      // Conversion events
      const hasConversion = sessions.some(session => 
        session.events.some(event => event.type === 'conversion')
      );
      if (hasConversion) score += 30;
    }
    
    return Math.min(score, 100); // Cap at 100
  };
  
  // Load leads with pagination
  const loadLeads = useCallback(async (isInitialLoad = false, lastDocSnapshot: DocumentSnapshot | null = null) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }
      
      // Build query
      const leadsQuery = collection(db, "visits");
      const constraints = [];
      
      // Filter by site if selected
      if (selectedSite !== "all") {
        constraints.push(where("siteId", "==", selectedSite));
      }
      
      // Filter by time range
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case "24h":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      
      constraints.push(where("timestamp", ">=", startDate));
      
      // Add sorting
      constraints.push(orderBy(sortBy, sortDirection));
      
      // Add pagination
      constraints.push(limit(pageSize));
      
      // Add start after if not initial load
      if (!isInitialLoad && lastDocSnapshot) {
        constraints.push(startAfter(lastDocSnapshot));
      }
      
      // Create query with all constraints
      const q = query(leadsQuery, ...constraints);
      
      // Execute query
      const querySnapshot = await getDocs(q);
      
      // Process results
      const leadsData: Lead[] = [];
      let lastVisible = null;
      
      if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
          const data = doc.data();
          leadsData.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp,
          } as Lead);
        });
        
        lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      }
      
      // For each lead, load sessions and calculate score
      for (const lead of leadsData) {
        // Get sessions for this lead
        const sessionsQuery = query(
          collection(db, "sessions"),
          where("clientId", "==", lead.clientId),
          orderBy("lastActivity", "desc")
        );
        
        const sessionsSnapshot = await getDocs(sessionsQuery);
        const sessions: Session[] = [];
        
        sessionsSnapshot.forEach(doc => {
          const data = doc.data();
          sessions.push({
            id: doc.id,
            ...data,
            startTime: data.startTime,
            lastActivity: data.lastActivity,
          } as Session);
        });
        
        // Calculate score
        lead.score = calculateLeadScore(lead, sessions);
        
        // If company ID is not set but IP is available, try to get company info
        if (!lead.companyId && lead.ip) {
          try {
            const ipInfo = await getIPInfo(lead.ip);
            lead.ipInfo = ipInfo;
            
            // Try to match to a company
            const companyId = await matchIPInfoToCompany(ipInfo);
            if (companyId) {
              lead.companyId = companyId;
              
              // Get company details
              const companyDoc = await getDoc(doc(db, "companies", companyId));
              if (companyDoc.exists()) {
                lead.matchedCompany = companyDoc.data() as Company;
                lead.companyName = lead.matchedCompany.name;
              }
            } else if (ipInfo.company?.name) {
              lead.companyName = ipInfo.company.name;
            } else if (ipInfo.org) {
              // Extract company name from org string (e.g., "AS15169 Google LLC" -> "Google LLC")
              const match = ipInfo.org.match(/AS\d+\s+(.*)/);
              if (match && match[1]) {
                lead.companyName = match[1].trim();
              } else {
                lead.companyName = ipInfo.org;
              }
            }
          } catch (error) {
            console.error("Error getting IP info:", error);
          }
        }
      }
      
      // Update state
      if (isInitialLoad) {
        setLeads(leadsData);
      } else {
        setLeads(prev => [...prev, ...leadsData]);
      }
      
      setLastDoc(lastVisible);
      setHasMore(leadsData.length === pageSize);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedSite, timeRange, sortBy, sortDirection, pageSize]);
  
  // Load sites
  const loadSites = useCallback(async () => {
    try {
      const sitesQuery = query(collection(db, "sites"), orderBy("name"));
      const querySnapshot = await getDocs(sitesQuery);
      
      const sitesData: Site[] = [];
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        sitesData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt,
        } as Site);
      });
      
      setSites(sitesData);
    } catch (err) {
      console.error("Error fetching sites:", err);
    }
  }, []);
  
  // Load sessions for selected lead
  const loadLeadSessions = useCallback(async (clientId: string) => {
    try {
      const sessionsQuery = query(
        collection(db, "sessions"),
        where("clientId", "==", clientId),
        orderBy("lastActivity", "desc")
      );
      
      const querySnapshot = await getDocs(sessionsQuery);
      
      const sessionsData: Session[] = [];
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        sessionsData.push({
          id: doc.id,
          ...data,
          startTime: data.startTime,
          lastActivity: data.lastActivity,
        } as Session);
      });
      
      setSelectedLeadSessions(sessionsData);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  }, []);
  
  // Initial data load
  useEffect(() => {
    loadLeads(true, null);
    loadSites();
  }, [loadLeads, loadSites]);
  
  // Reload data when filters change
  useEffect(() => {
    loadLeads(true, null);
  }, [selectedSite, timeRange, sortBy, sortDirection, loadLeads]);
  
  // Load sessions when lead is selected
  useEffect(() => {
    if (selectedLead) {
      loadLeadSessions(selectedLead.clientId);
    }
  }, [selectedLead, loadLeadSessions]);
  
  // Handle lead selection
  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
  };
  
  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle site filter change
  const handleSiteChange = (siteId: string) => {
    setSelectedSite(siteId);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };
  
  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to desc
      setSortBy(field);
      setSortDirection("desc");
    }
  };
  
  // Generate tracking script for a site
  const getTrackingScript = (siteId: string) => {
    return `
<!-- Adealo Tracking Script -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AdealoTracker']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    w[o].l=1*new Date();js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.async=1;js.src=f;js.id='adealo-tracking';fjs.parentNode.insertBefore(js,fjs);
  })(window,document,'script','adealo','https://us-central1-adealo-ce238.cloudfunctions.net/getTrackingScript?siteId=${siteId}');
</script>
<!-- End Adealo Tracking Script -->
    `;
  };
  
  // Copy tracking script to clipboard
  const copyTrackingScript = (siteId: string) => {
    const script = getTrackingScript(siteId);
    navigator.clipboard.writeText(script);
    alert("Tracking script copied to clipboard!");
  };
  
  // Format date
  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return "N/A";
    
    return new Date(timestamp.toMillis()).toLocaleString();
  };
  
  // Filter leads by search query
  const filteredLeads = searchQuery 
    ? leads.filter(lead => 
        (lead.companyName && lead.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.ip && lead.ip.includes(searchQuery)) ||
        (lead.country && lead.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.city && lead.city.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : leads;
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/30 bg-card shadow-sm z-10">
        <div className="flex items-center gap-3 px-4 w-full">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto flex items-center gap-4">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search leads..."
                className="w-full pl-8 h-9 rounded-md border border-input/50 bg-background/50 px-3 py-1 text-sm"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadLeads(true, null)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 bg-background w-full">
        {/* Filter bar */}
        <div className="border-b border-border/30 bg-card/50 py-4 px-4 w-full">
          <div className="flex flex-wrap items-center gap-4">
            {/* Site filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Site:</label>
              <select
                className="h-9 rounded-md border border-input/50 bg-background/50 px-3 py-1 text-sm"
                value={selectedSite}
                onChange={(e) => handleSiteChange(e.target.value)}
              >
                <option value="all">All Sites</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Time range filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Time Range:</label>
              <select
                className="h-9 rounded-md border border-input/50 bg-background/50 px-3 py-1 text-sm"
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
            
            {/* Script instructions button */}
            <div className="ml-auto">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowScriptInstructions(!showScriptInstructions)}
              >
                <Code className="h-4 w-4 mr-2" />
                {showScriptInstructions ? "Hide Script" : "Show Tracking Script"}
              </Button>
            </div>
          </div>
          
          {/* Script instructions */}
          {showScriptInstructions && (
            <div className="mt-4 p-4 bg-muted/30 rounded-md">
              <h3 className="text-sm font-medium mb-2">Tracking Script Installation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add the following script to your website's <code>&lt;head&gt;</code> section to start tracking visitors:
              </p>
              
              <div className="relative">
                <pre className="bg-background p-4 rounded-md text-xs overflow-x-auto">
                  {getTrackingScript(selectedSite !== "all" ? selectedSite : (sites[0]?.id || "your-site-id"))}
                </pre>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyTrackingScript(selectedSite !== "all" ? selectedSite : (sites[0]?.id || "your-site-id"))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center mt-4 text-sm">
                <Info className="h-4 w-4 mr-2 text-primary" />
                <span>After adding the script, it may take a few minutes for data to appear in your dashboard.</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 w-full max-w-none">
          {loading && !selectedLead ? (
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
                <Button onClick={() => loadLeads(true, null)}>Try Again</Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Lead feed */}
              <div className={`w-full ${selectedLead ? 'lg:w-2/3' : 'lg:w-full'}`}>
                <Card className="rounded-xl shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle>Lead Feed</CardTitle>
                    <CardDescription>
                      {filteredLeads.length} leads found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead 
                              className="cursor-pointer"
                              onClick={() => handleSortChange("score")}
                            >
                              Score
                              {sortBy === "score" && (
                                sortDirection === "desc" ? 
                                <ChevronDown className="inline h-4 w-4 ml-1" /> : 
                                <ChevronUp className="inline h-4 w-4 ml-1" />
                              )}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer"
                              onClick={() => handleSortChange("companyName")}
                            >
                              Company
                              {sortBy === "companyName" && (
                                sortDirection === "desc" ? 
                                <ChevronDown className="inline h-4 w-4 ml-1" /> : 
                                <ChevronUp className="inline h-4 w-4 ml-1" />
                              )}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer"
                              onClick={() => handleSortChange("country")}
                            >
                              Location
                              {sortBy === "country" && (
                                sortDirection === "desc" ? 
                                <ChevronDown className="inline h-4 w-4 ml-1" /> : 
                                <ChevronUp className="inline h-4 w-4 ml-1" />
                              )}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer"
                              onClick={() => handleSortChange("timestamp")}
                            >
                              Timestamp
                              {sortBy === "timestamp" && (
                                sortDirection === "desc" ? 
                                <ChevronDown className="inline h-4 w-4 ml-1" /> : 
                                <ChevronUp className="inline h-4 w-4 ml-1" />
                              )}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLeads.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                No leads found. Add the tracking script to your website to start collecting leads.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredLeads.map((lead) => (
                              <TableRow 
                                key={lead.id}
                                className={`cursor-pointer ${selectedLead?.id === lead.id ? 'bg-muted/50' : ''}`}
                                onClick={() => handleSelectLead(lead)}
                              >
                                <TableCell>
                                  <div className="flex items-center">
                                    <div 
                                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium
                                        ${lead.score && lead.score >= 70 ? 'bg-accent' : 
                                          lead.score && lead.score >= 40 ? 'bg-secondary' : 'bg-muted-foreground'}`}
                                    >
                                      {lead.score || 0}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {lead.companyName || 'Unknown Company'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {lead.ip}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {lead.country ? (
                                    <div className="flex items-center">
                                      <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
                                      <span>{lead.country}</span>
                                      {lead.city && (
                                        <span className="ml-1 text-muted-foreground">
                                          ({lead.city})
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">Unknown location</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                    <span>{formatDate(lead.timestamp)}</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Load more button */}
                    {hasMore && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          onClick={() => loadLeads(false, lastDoc)}
                          disabled={loadingMore}
                        >
                          {loadingMore ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "Load More"
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Lead details */}
              {selectedLead && (
                <div className="w-full lg:w-1/3">
                  <Card className="rounded-xl shadow-sm sticky top-4">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{selectedLead.companyName || 'Unknown Company'}</CardTitle>
                          <CardDescription>
                            Lead Details
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedLead(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Lead score */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Lead Score</span>
                          <div 
                            className={`px-3 py-1 rounded-full text-white text-sm font-medium
                              ${selectedLead.score && selectedLead.score >= 70 ? 'bg-accent' : 
                                selectedLead.score && selectedLead.score >= 40 ? 'bg-secondary' : 'bg-muted-foreground'}`}
                          >
                            {selectedLead.score || 0}/100
                          </div>
                        </div>
                        
                        <Separator />
                        
                        {/* Company information */}
                        <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            Company Information
                          </h3>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Name</span>
                              <span className="text-sm font-medium">{selectedLead.companyName || 'Unknown'}</span>
                            </div>
                            
                            {selectedLead.matchedCompany && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Industry</span>
                                  <span className="text-sm font-medium">{selectedLead.matchedCompany.info?.naceCategories || 'Unknown'}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Employees</span>
                                  <span className="text-sm font-medium">{selectedLead.matchedCompany.info?.numberOfEmployees || 'Unknown'}</span>
                                </div>
                                
                                {selectedLead.matchedCompany.contact?.homePage && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Website</span>
                                    <a 
                                      href={selectedLead.matchedCompany.contact.homePage} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm font-medium text-primary hover:underline flex items-center"
                                    >
                                      {selectedLead.matchedCompany.contact.homePage}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        
                        <Separator />
                        
                        {/* Visit information */}
                        <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            Visit Information
                          </h3>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">IP Address</span>
                              <span className="text-sm font-medium">{selectedLead.ip}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Location</span>
                              <span className="text-sm font-medium">
                                {selectedLead.city && selectedLead.country 
                                  ? `${selectedLead.city}, ${selectedLead.country}`
                                  : selectedLead.country || 'Unknown'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">First Seen</span>
                              <span className="text-sm font-medium">{formatDate(selectedLead.timestamp)}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Sessions</span>
                              <span className="text-sm font-medium">{selectedLeadSessions.length}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Page Views</span>
                              <span className="text-sm font-medium">
                                {selectedLeadSessions.reduce((sum, session) => sum + session.pageviews, 0)}
                              </span>
                            </div>
                            
                            {selectedLead.referrer && (
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Referrer</span>
                                <span className="text-sm font-medium truncate max-w-[150px]" title={selectedLead.referrer}>
                                  {selectedLead.referrer}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Session history */}
                        {selectedLeadSessions.length > 0 && (
                          <>
                            <Separator />
                            
                            <div>
                              <h3 className="text-sm font-medium mb-2 flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Session History
                              </h3>
                              
                              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {selectedLeadSessions.map((session) => (
                                  <div key={session.id} className="bg-muted/30 p-3 rounded-md">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs text-muted-foreground">
                                        {formatDate(session.lastActivity)}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {session.pageviews} {session.pageviews === 1 ? 'page' : 'pages'}
                                      </Badge>
                                    </div>
                                    
                                    {session.events && session.events.length > 0 && (
                                      <div className="space-y-1 mt-2">
                                        {session.events.slice(0, 5).map((event, index) => (
                                          <div key={index} className="flex items-center text-xs">
                                            <div className="w-4 h-4 mr-2 flex-shrink-0">
                                              {event.type === 'pageview' ? (
                                                <Globe className="h-3 w-3 text-primary" />
                                              ) : event.type === 'conversion' ? (
                                                <CheckCircle className="h-3 w-3 text-accent" />
                                              ) : (
                                                <Info className="h-3 w-3 text-secondary" />
                                              )}
                                            </div>
                                            <span className="truncate" title={event.path}>
                                              {event.path || '/'}
                                            </span>
                                          </div>
                                        ))}
                                        
                                        {session.events.length > 5 && (
                                          <div className="text-xs text-muted-foreground text-center mt-1">
                                            +{session.events.length - 5} more events
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
