"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User,
  Settings,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <div className="flex items-center justify-between w-full">
      <ThemeToggle />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-9 px-2 gap-2 hover:bg-muted/30 transition-colors duration-200 rounded-md"
          >
            <Avatar className="h-7 w-7 rounded-full border border-border/50">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs font-medium transition-colors duration-200">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-md"
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-3 px-3 py-3 text-left text-sm border-b border-border/50">
              <Avatar className="h-9 w-9 rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs font-medium transition-colors duration-200">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <div className="py-1.5">
            <DropdownMenuGroup>
              <DropdownMenuItem className="focus:bg-muted/30 rounded-sm mx-1 px-3 py-2">
                <Sparkles className="mr-3 h-4 w-4 text-accent" />
                <span>Upgrade to Pro</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1 bg-border/50" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="focus:bg-muted/30 rounded-sm mx-1 px-3 py-2">
                <User className="mr-3 h-4 w-4 text-muted-foreground" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-muted/30 rounded-sm mx-1 px-3 py-2">
                <CreditCard className="mr-3 h-4 w-4 text-muted-foreground" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-muted/30 rounded-sm mx-1 px-3 py-2">
                <Bell className="mr-3 h-4 w-4 text-muted-foreground" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-muted/30 rounded-sm mx-1 px-3 py-2">
                <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1 bg-border/50" />
            <DropdownMenuItem className="focus:bg-muted/30 rounded-sm mx-1 px-3 py-2 text-destructive focus:text-destructive">
              <LogOut className="mr-3 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
