import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Settings, 
  CreditCard, 
  Building, 
  Mail, 
  Zap, 
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const settingsSections = [
    {
      id: "team",
      title: "Team & Workspace",
      description: "Manage your team members and workspace settings",
      icon: Users,
      items: [
        { id: "users", title: "Users and teams", description: "Manage users and team permissions" },
        { id: "plan", title: "Plan overview", description: "View your current plan and usage" },
        { id: "integrations", title: "Integrations", description: "Connect with other tools and services" },
      ]
    },
    {
      id: "account",
      title: "Account Settings",
      description: "Manage your personal account settings",
      icon: Settings,
      items: [
        { id: "profile", title: "Your profile", description: "Update your personal information" },
        { id: "notifications", title: "Activity & notifications", description: "Configure your notification preferences" },
        { id: "appearance", title: "Appearance", description: "Customize the look and feel of the application" },
      ]
    },
    {
      id: "billing",
      title: "Billing & Subscription",
      description: "Manage your billing information and subscription",
      icon: CreditCard,
      items: [
        { id: "usage", title: "View credit usage", description: "Monitor your credit usage and history" },
        { id: "upgrade", title: "Upgrade Plan", description: "Explore available plan options" },
        { id: "extension", title: "Get the Chrome extension", description: "Install our browser extension" },
      ]
    }
  ];
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/30 bg-card shadow-sm z-10">
        <div className="flex items-center gap-3 px-4 w-full">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Admin Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 bg-background w-full">
        <div className="border-b border-border/30 bg-card/50 py-4 px-6 w-full">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Admin Settings</h1>
              <p className="text-muted-foreground">
                Configure your workspace and account settings
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Settings navigation */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {settingsSections.map((section) => (
                    <div key={section.id} className="py-2">
                      <div className="px-4 py-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <section.icon className="h-4 w-4" />
                          <span>{section.title}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {section.items.map((item) => (
                          <button
                            key={item.id}
                            className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/50 ${
                              activeSection === item.id ? "bg-muted/50 font-medium" : ""
                            }`}
                            onClick={() => setActiveSection(item.id)}
                          >
                            <span>{item.title}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Upgrade button */}
            <div className="mt-4">
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </div>
          
          {/* Settings content */}
          <div className="md:col-span-2">
            {activeSection ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {settingsSections
                      .flatMap(section => section.items)
                      .find(item => item.id === activeSection)?.title || "Settings"}
                  </CardTitle>
                  <CardDescription>
                    {settingsSections
                      .flatMap(section => section.items)
                      .find(item => item.id === activeSection)?.description || "Configure your settings"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This is a placeholder for the {activeSection} settings content.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>
                    Select a settings category from the sidebar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Choose a settings option from the left sidebar to view and edit your settings.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
