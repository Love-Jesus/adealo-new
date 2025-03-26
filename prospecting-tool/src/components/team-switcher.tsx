import * as React from "react"
import { ChevronsUpDown, Plus, Building } from "lucide-react"
import { AdealoLogo } from "@/components/adealo-logo"
import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-11 w-full justify-start gap-3 px-3 hover:bg-muted/30 transition-colors duration-200 rounded-md"
        >
          <div className="bg-primary/10 text-primary flex aspect-square h-7 w-7 items-center justify-center rounded-md transition-colors duration-200">
            {activeTeam.name === "Adealo" ? (
              <AdealoLogo className="h-4 w-4" />
            ) : (
              <activeTeam.logo className="h-4 w-4" />
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{activeTeam.name}</span>
            <span className="truncate text-xs text-muted-foreground">{activeTeam.plan}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-md"
        align="start"
        side={isMobile ? "bottom" : "right"}
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal px-2 pt-2 pb-1">
          Teams
        </DropdownMenuLabel>
        {teams.map((team, index) => (
          <DropdownMenuItem
            key={team.name}
            onClick={() => setActiveTeam(team)}
            className="gap-3 p-2 focus:bg-muted/30 rounded-sm mx-1"
          >
            <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-200">
              {team.name === "Adealo" ? (
                <AdealoLogo className="h-4 w-4" />
              ) : (
                <team.logo className="h-4 w-4" />
              )}
            </div>
            <span className="font-medium">{team.name}</span>
            <DropdownMenuShortcut className="text-muted-foreground/50">⌘{index + 1}</DropdownMenuShortcut>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="my-1 bg-border/50" />
        <DropdownMenuItem className="gap-3 p-2 focus:bg-muted/30 rounded-sm mx-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-muted-foreground/30 transition-colors duration-200">
            <Plus className="h-4 w-4 text-muted-foreground/70" />
          </div>
          <span className="text-muted-foreground">Create new team</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
