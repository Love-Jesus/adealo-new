"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { NavTooltip } from "@/components/ui/nav-tooltip"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    supportTrigger?: boolean
    description?: string
    beta?: boolean
    items?: {
      title: string
      url: string
      isActive?: boolean
    }[]
  }[]
}) {
  const location = useLocation();
  return (
    <SidebarMenu>
      {items.map((item) => (
        <Collapsible
          key={item.title}
          asChild
          defaultOpen={item.isActive}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              {item.description ? (
                <NavTooltip 
                  content={item.title}
                  description={item.description}
                >
                  {item.supportTrigger ? (
                  <SidebarMenuButton 
                    isActive={item.isActive}
                    data-support-trigger={item.supportTrigger ? "true" : undefined}
                    className={`sidebar-menu-button transition-colors duration-200 rounded-md ${
                      item.isActive ? "active-menu-item" : ""
                    }`}
                  >
                      {item.icon && (
                        <item.icon 
                          className="text-muted-foreground" 
                          strokeWidth={1.75}
                        />
                      )}
                      <span className={`${item.isActive ? "font-medium text-sidebar-foreground" : ""} whitespace-nowrap`}>
                        {item.title}
                        {item.beta && (
                          <span className="ml-1.5 text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded-sm">
                            BETA
                          </span>
                        )}
                      </span>
                      {item.items && item.items.length > 0 && (
                        <ChevronRight 
                          className="ml-auto transition-transform duration-200 opacity-60 group-data-[state=open]/collapsible:rotate-90" 
                          strokeWidth={1.75}
                        />
                      )}
                    </SidebarMenuButton>
                  ) : (
                    <Link to={item.url} style={{ textDecoration: 'none' }}>
                      <SidebarMenuButton 
                        isActive={location.pathname === item.url}
                        className={`sidebar-menu-button transition-colors duration-200 rounded-md ${
                          location.pathname === item.url ? "active-menu-item" : ""
                        }`}
                      >
                        {item.icon && (
                          <item.icon 
                            className="text-muted-foreground" 
                            strokeWidth={1.75}
                          />
                        )}
                        <span className={`${location.pathname === item.url ? "font-medium text-sidebar-foreground" : ""} whitespace-nowrap`}>
                        {item.title}
                        {item.beta && (
                          <span className="ml-1.5 text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded-sm">
                            BETA
                          </span>
                        )}
                      </span>
                        {item.items && item.items.length > 0 && (
                          <ChevronRight 
                            className="ml-auto transition-transform duration-200 opacity-60 group-data-[state=open]/collapsible:rotate-90" 
                            strokeWidth={1.75}
                          />
                        )}
                      </SidebarMenuButton>
                    </Link>
                  )}
                </NavTooltip>
              ) : (
                item.supportTrigger ? (
                  <SidebarMenuButton 
                    tooltip={item.title}
                    isActive={item.isActive}
                    data-support-trigger={item.supportTrigger ? "true" : undefined}
                    className={`sidebar-menu-button transition-colors duration-200 rounded-md ${
                      item.isActive ? "active-menu-item" : ""
                    }`}
                  >
                    {item.icon && (
                      <item.icon 
                        className="text-muted-foreground" 
                        strokeWidth={1.75}
                      />
                    )}
                    <span className={`${item.isActive ? "font-medium text-sidebar-foreground" : ""} whitespace-nowrap`}>{item.title}</span>
                    {item.items && item.items.length > 0 && (
                      <ChevronRight 
                        className="ml-auto transition-transform duration-200 opacity-60 group-data-[state=open]/collapsible:rotate-90" 
                        strokeWidth={1.75}
                      />
                    )}
                  </SidebarMenuButton>
                ) : (
                  <Link to={item.url} style={{ textDecoration: 'none' }}>
                    <SidebarMenuButton 
                      tooltip={item.title}
                      isActive={location.pathname === item.url}
                      className={`sidebar-menu-button transition-colors duration-200 rounded-md ${
                        location.pathname === item.url ? "active-menu-item" : ""
                      }`}
                    >
                      {item.icon && (
                        <item.icon 
                          className="text-muted-foreground" 
                          strokeWidth={1.75}
                        />
                      )}
                      <span className={`${location.pathname === item.url ? "font-medium text-sidebar-foreground" : ""} whitespace-nowrap`}>{item.title}</span>
                      {item.items && item.items.length > 0 && (
                        <ChevronRight 
                          className="ml-auto transition-transform duration-200 opacity-60 group-data-[state=open]/collapsible:rotate-90" 
                          strokeWidth={1.75}
                        />
                      )}
                    </SidebarMenuButton>
                  </Link>
                )
              )}
            </CollapsibleTrigger>
            {item.items && item.items.length > 0 && (
              <CollapsibleContent>
                <SidebarMenuSub className="border-l-[1.5px] border-sidebar-border ml-4 pl-2">
                  {item.items.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton 
                        asChild
                        isActive={location.pathname === subItem.url}
                        className={`transition-colors duration-200 rounded-md ${
                          location.pathname === subItem.url ? "active-menu-item" : ""
                        }`}
                      >
                        <Link to={subItem.url} style={{ textDecoration: 'none' }}>
                          <span className={location.pathname === subItem.url ? "text-sidebar-foreground font-medium" : "text-muted-foreground"}>
                            {subItem.title}
                          </span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            )}
          </SidebarMenuItem>
        </Collapsible>
      ))}
    </SidebarMenu>
  )
}
