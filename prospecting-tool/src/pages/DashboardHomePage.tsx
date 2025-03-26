import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  Calendar, 
  MousePointerClick, 
  BarChart3,
  Clock,
  Filter,
  RefreshCw
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";

// Mock data for initial development
// In a real implementation, this would come from Firestore
const mockData = {
  totalLeads: 1234,
  leadGrowth: 12.5,
  totalInteractions: 3456,
  interactionGrowth: -2.3,
  totalWidgets: 8,
  activeWidgets: 5,
  conversionRate: 5.2,
  conversionGrowth: 0.8,
  leadsByMonth: [
    { month: 'Jan', leads: 120 },
    { month: 'Feb', leads: 150 },
    { month: 'Mar', leads: 180 },
    { month: 'Apr', leads: 210 },
    { month: 'May', leads: 240 },
    { month: 'Jun', leads: 270 },
    { month: 'Jul', leads: 300 },
    { month: 'Aug', leads: 330 },
    { month: 'Sep', leads: 360 },
    { month: 'Oct', leads: 390 },
    { month: 'Nov', leads: 420 },
    { month: 'Dec', leads: 450 },
  ],
  widgetPerformance: [
    { name: 'Sales Demo', interactions: 1245, leads: 42, conversion: 3.4 },
    { name: 'Product Tour', interactions: 876, leads: 23, conversion: 2.6 },
    { name: 'Newsletter', interactions: 1532, leads: 67, conversion: 4.4 },
    { name: 'Contact Form', interactions: 943, leads: 31, conversion: 3.3 },
  ],
  leadSources: [
    { source: 'Organic', percentage: 45 },
    { source: 'Referral', percentage: 25 },
    { source: 'Direct', percentage: 20 },
    { source: 'Social', percentage: 10 },
  ],
  recentActivity: [
    { 
      type: 'lead', 
      company: 'Acme Inc.', 
      action: 'New lead captured', 
      timestamp: new Date('2025-03-17T10:30:00') 
    },
    { 
      type: 'widget', 
      company: 'TechCorp', 
      action: 'Widget interaction', 
      timestamp: new Date('2025-03-17T09:45:00') 
    },
    { 
      type: 'conversion', 
      company: 'Global Services', 
      action: 'Demo booked', 
      timestamp: new Date('2025-03-17T08:15:00') 
    },
    { 
      type: 'lead', 
      company: 'Startup XYZ', 
      action: 'New lead captured', 
      timestamp: new Date('2025-03-16T16:20:00') 
    },
    { 
      type: 'widget', 
      company: 'Enterprise Ltd', 
      action: 'Widget interaction', 
      timestamp: new Date('2025-03-16T14:10:00') 
    },
  ]
};

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon 
}: { 
  title: string; 
  value: string | number; 
  change?: number; 
  icon: React.ElementType 
}) {
  return (
    <Card className="dashboard-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            
            {change !== undefined && (
              <div className={`flex items-center mt-1 text-xs font-medium ${change >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {change >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                <span>{Math.abs(change)}% from last period</span>
              </div>
            )}
          </div>
          
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Chart Component (placeholder)
// In a real implementation, this would use a charting library like Recharts
function Chart({ title, description, height = 300 }: { title: string; description?: string; height?: number }) {
  return (
    <Card className="col-span-2 dashboard-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div 
          className="bg-muted/30 rounded-md flex items-center justify-center"
          style={{ height: `${height}px` }}
        >
          <p className="text-muted-foreground">Chart Placeholder</p>
          <p className="text-xs text-muted-foreground">(Will be implemented with Recharts)</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Activity Item Component
function ActivityItem({ 
  type, 
  company, 
  action, 
  timestamp 
}: { 
  type: string; 
  company: string; 
  action: string; 
  timestamp: Date 
}) {
  const getIcon = () => {
    switch (type) {
      case 'lead':
        return <Users className="h-4 w-4 text-primary" />;
      case 'widget':
        return <MousePointerClick className="h-4 w-4 text-secondary" />;
      case 'conversion':
        return <Calendar className="h-4 w-4 text-accent" />;
      default:
        return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
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
  
  return (
    <div className="flex items-start space-x-3 py-3">
      <div className="mt-1">{getIcon()}</div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{company}</p>
          <span className="text-xs text-muted-foreground">{formatTime(timestamp)}</span>
        </div>
        <p className="text-sm text-muted-foreground">{action}</p>
      </div>
    </div>
  );
}

// Time Period Filter Component
function TimePeriodFilter({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void 
}) {
  return (
    <div className="flex items-center space-x-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-input/50 bg-background/50 px-3 py-1 text-sm"
      >
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
        <option value="90d">Last 90 Days</option>
        <option value="year">This Year</option>
        <option value="all">All Time</option>
      </select>
    </div>
  );
}

export default function DashboardHomePage() {
  const [timePeriod, setTimePeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(mockData);
  
  // In a real implementation, this would fetch data from Firestore
  // based on the selected time period
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // This would be replaced with actual Firestore queries
        // For now, we'll just use the mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setDashboardData(mockData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [timePeriod]);
  
  // Handle refresh
  const handleRefresh = () => {
    // Refetch data
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setDashboardData(mockData);
      setIsLoading(false);
    }, 500);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/30 bg-card shadow-sm z-10">
        <div className="flex items-center gap-3 px-4 w-full">
          {/* SidebarTrigger removed - now inside the sidebar */}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 bg-background w-full">
        {/* Page header - removed */}

        {/* Dashboard content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <TabsList className="mb-4 bg-transparent p-0 gap-2">
                <TabsTrigger value="overview" className="px-4">Overview</TabsTrigger>
                <TabsTrigger value="leads" className="px-4">Leads</TabsTrigger>
                <TabsTrigger value="widgets" className="px-4">Widgets</TabsTrigger>
              </TabsList>
              
              {/* Moved filtering to the same level as tabs */}
              <TimePeriodFilter value={timePeriod} onChange={setTimePeriod} />
            </div>
            
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* Metrics row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                  title="Total Leads" 
                  value={dashboardData.totalLeads} 
                  change={dashboardData.leadGrowth} 
                  icon={Users} 
                />
                <MetricCard 
                  title="Widget Interactions" 
                  value={dashboardData.totalInteractions} 
                  change={dashboardData.interactionGrowth} 
                  icon={MousePointerClick} 
                />
                <MetricCard 
                  title="Conversion Rate" 
                  value={`${dashboardData.conversionRate}%`} 
                  change={dashboardData.conversionGrowth} 
                  icon={BarChart3} 
                />
                <MetricCard 
                  title="Active Widgets" 
                  value={`${dashboardData.activeWidgets}/${dashboardData.totalWidgets}`} 
                  icon={Calendar} 
                />
              </div>
              
              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <Chart 
                  title="Lead Generation Over Time" 
                  description="Monthly lead acquisition" 
                  height={300}
                />
                <Card className="lg:col-span-2 dashboard-card">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest leads and interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {dashboardData.recentActivity.map((activity, index) => (
                        <ActivityItem 
                          key={index}
                          type={activity.type}
                          company={activity.company}
                          action={activity.action}
                          timestamp={activity.timestamp}
                        />
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      View All Activity
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              {/* Bottom row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Chart 
                  title="Widget Performance" 
                  description="Interactions and conversions by widget" 
                  height={250}
                />
                <Chart 
                  title="Lead Sources" 
                  description="Where your leads are coming from" 
                  height={250}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="leads" className="mt-0">
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>Lead Analytics</CardTitle>
                  <CardDescription>Detailed lead generation metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This tab would contain more detailed lead analytics.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="widgets" className="mt-0">
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>Widget Analytics</CardTitle>
                  <CardDescription>Performance metrics for your widgets</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This tab would contain more detailed widget analytics.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
