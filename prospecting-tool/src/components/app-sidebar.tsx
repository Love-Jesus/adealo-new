import * as React from "react"
import {
  Bot,
  Contact,
  HelpCircle,
  Settings2,
  Target,
  Users,
  LayoutGrid,
  Search,
  Bell,
  BarChart3,
  Briefcase,
  Building,
  Zap,
  Plus,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MessageSquare,
  UserPlus
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AdealoLogo } from "@/components/adealo-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  useSidebar
} from "@/components/ui/sidebar"

// Application data
const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    {
      name: "Adealo",
      logo: Target,
      plan: "Enterprise",
    },
  ],
  // Main navigation categories
  mainNav: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutGrid,
      isActive: true,
      description: "Overview of your prospecting and lead generation activities",
      items: []
    }
  ],
  // Engagement category
  engagementNav: [
    {
      title: "Prospecting",
      url: "/prospecting",
      icon: Target,
      description: "Search and filter companies for your prospecting campaigns",
      beta: true,
      items: []
    },
    {
      title: "Leads",
      url: "/leads",
      icon: Zap,
      description: "Track and manage leads captured from your website",
      items: []
    },
    {
      title: "Widgets",
      url: "/intelligence",
      icon: Bot,
      description: "Create and manage widgets for your website",
      items: []
    },
    {
      title: "Chat Support",
      url: "/chat",
      icon: MessageSquare,
      description: "Manage customer conversations and support requests",
      items: []
    },
    {
      title: "Pricing",
      url: "/pricing",
      icon: CreditCard,
      description: "View and compare subscription plans",
      items: []
    }
  ],
  // Analytics category
  analyticsNav: [
    {
      title: "Analytics",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Dashboard",
          url: "#",
        },
        {
          title: "Reports",
          url: "#",
        },
        {
          title: "Metrics",
          url: "#",
        },
      ],
    }
  ],
  // Settings category
  settingsNav: [
    {
      title: "Team",
      url: "/team",
      icon: UserPlus,
      description: "Manage your team members and invitations",
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings2,
      description: "Configure your workspace and account settings",
    },
    {
      title: "Subscription",
      url: "/account/subscription",
      icon: CreditCard,
      description: "Manage your subscription and billing",
    },
    {
      title: "Help",
      url: "#",
      icon: HelpCircle,
      description: "Get help and documentation",
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar, state, isHovered } = useSidebar();
  return (
    <Sidebar 
      collapsible="icon" 
      {...props} 
      className="glass-sidebar border-r border-sidebar-border/30"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex items-center">
              {/* Logo for expanded state only */}
              <div className="group-data-[state=expanded]:block group-data-[state=collapsed]:hidden">
                <AdealoLogo className="h-5 w-auto" />
              </div>
              {/* Maximize button for collapsed state */}
              <Button
                variant="ghost"
                size="sm"
                className="group-data-[state=expanded]:hidden group-data-[state=collapsed]:flex p-1 h-8 w-8 rounded-md hover:bg-muted/30 items-center justify-center"
                onClick={toggleSidebar}
                title="Maximize Sidebar"
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground/70" />
                <span className="sr-only">Maximize Sidebar</span>
              </Button>
            </div>
          </div>
          
          {/* Minimize button that only shows when sidebar is expanded */}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-7 w-7 rounded-full hover:bg-muted/30 group-data-[state=collapsed]:hidden"
            onClick={toggleSidebar}
            title="Minimize Sidebar"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground/70" />
            <span className="sr-only">Minimize Sidebar</span>
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-3">
        {/* Overview & Analytics */}
        <SidebarGroup className="mb-2">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2 px-1">
            Overview & Analytics
          </SidebarGroupLabel>
          <NavMain items={data.mainNav} />
        </SidebarGroup>
        
        <SidebarSeparator className="my-4 bg-border/50" />
        
        {/* Tools */}
        <SidebarGroup className="mb-2">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2 px-1">
            Tools
          </SidebarGroupLabel>
          <NavMain items={data.engagementNav} />
        </SidebarGroup>
        
        <SidebarSeparator className="my-4 bg-border/50" />
        
        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2 px-1">
            Settings
          </SidebarGroupLabel>
          <NavMain items={data.settingsNav} />
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border/30 p-4">
        <div className="flex justify-end mb-3 group-data-[collapsible=icon]:justify-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="p-1 h-8 w-8 rounded-full hover:bg-muted/30"
            title="Create Team"
          >
            <Plus className="h-5 w-5 text-muted-foreground/70" />
            <span className="sr-only">Create Team</span>
          </Button>
        </div>
        <div className="group-data-[collapsible=icon]:hidden">
          <NavUser user={data.user} />
        </div>
      </SidebarFooter>
      
      {/* SidebarRail removed */}
    </Sidebar>
  )
}
