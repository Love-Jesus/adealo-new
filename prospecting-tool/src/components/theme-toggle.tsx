"use client"

import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-md hover:bg-muted/30 transition-colors duration-200"
        >
          <Sun className={`h-[18px] w-[18px] transition-all text-primary ${theme === 'dark' ? '-rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
          <Moon className={`absolute h-[18px] w-[18px] transition-all text-primary ${theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-md">
        <DropdownMenuItem 
          onClick={() => setTheme("light")} 
          className="focus:bg-muted/30 rounded-sm mx-1 px-3 py-2"
        >
          <Sun className="mr-3 h-4 w-4 text-accent" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")} 
          className="focus:bg-muted/30 rounded-sm mx-1 px-3 py-2"
        >
          <Moon className="mr-3 h-4 w-4 text-primary" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")} 
          className="focus:bg-muted/30 rounded-sm mx-1 px-3 py-2"
        >
          <Laptop className="mr-3 h-4 w-4 text-muted-foreground" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
