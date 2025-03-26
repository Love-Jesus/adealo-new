"use client"

import { useState } from "react"
import { 
  Filter, 
  ChevronDown, 
  Plus, 
  X, 
  Download, 
  Save, 
  Building, 
  Users, 
  MapPin, 
  DollarSign 
} from "lucide-react"
import { ExportPanel } from "@/components/export-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// Define filter types
export type FilterType = 'industry' | 'location' | 'employees' | 'revenue'

export interface FilterOption {
  id: string
  type: FilterType
  label: string
  value: string
}

interface FilterBarProps {
  onFilterChange: (filters: FilterOption[]) => void
  onExport: () => void
  onSaveList: () => void
  totalResults: number
}

export function FilterBar({ onFilterChange, onExport, onSaveList, totalResults }: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([])
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)

  // Add a filter
  const addFilter = (filter: FilterOption) => {
    const newFilters = [...activeFilters, filter]
    setActiveFilters(newFilters)
    onFilterChange(newFilters)
    setFilterMenuOpen(false)
  }

  // Remove a filter
  const removeFilter = (filterId: string) => {
    const newFilters = activeFilters.filter(f => f.id !== filterId)
    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([])
    onFilterChange([])
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Popover open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 bg-background border-border/50 hover:bg-accent/20 transition-colors"
              >
                <Filter className="h-4 w-4 text-primary/80" />
                <span>Filter</span>
                <ChevronDown className="h-4 w-4 ml-1 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px] p-0 rounded-xl shadow-lg border-border/60" align="start">
              <div className="flex">
                {/* Left sidebar with filter categories */}
                <div className="w-[200px] border-r border-border/40 p-2 space-y-1 bg-muted/10">
                  <div className="px-2 py-2 text-sm font-medium text-foreground/80">Filter Categories</div>
                  <Button variant="ghost" className="w-full justify-start text-sm font-normal h-9 hover:bg-accent/20">
                    <Building className="h-4 w-4 mr-2 text-primary/80" />
                    Company
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm font-normal h-9 hover:bg-accent/20">
                    <Users className="h-4 w-4 mr-2 text-primary/80" />
                    People
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm font-normal h-9 hover:bg-accent/20">
                    <MapPin className="h-4 w-4 mr-2 text-primary/80" />
                    Location
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm font-normal h-9 hover:bg-accent/20">
                    <DollarSign className="h-4 w-4 mr-2 text-primary/80" />
                    Financial
                  </Button>
                </div>
                
                {/* Right content area with filter cards */}
                <div className="flex-1 p-5">
                  <div className="mb-4">
                    <h3 className="text-base font-medium mb-1">Common Filters</h3>
                    <p className="text-xs text-muted-foreground">Select from frequently used filters</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FilterCard
                      title="Industry"
                      description="Filter by industry type"
                      icon={<Building className="h-5 w-5" />}
                      onApply={(value) => addFilter({
                        id: `industry-${Date.now()}`,
                        type: 'industry',
                        label: 'Industry',
                        value
                      })}
                    />
                    
                    <FilterCard
                      title="Location"
                      description="Filter by country or region"
                      icon={<MapPin className="h-5 w-5" />}
                      onApply={(value) => addFilter({
                        id: `location-${Date.now()}`,
                        type: 'location',
                        label: 'Location',
                        value
                      })}
                    />
                    
                    <FilterCard
                      title="Company Size"
                      description="Filter by number of employees"
                      icon={<Users className="h-5 w-5" />}
                      onApply={(value) => addFilter({
                        id: `employees-${Date.now()}`,
                        type: 'employees',
                        label: 'Employees',
                        value
                      })}
                      options={[
                        { label: "1-10", value: "1-10" },
                        { label: "11-50", value: "11-50" },
                        { label: "51-200", value: "51-200" },
                        { label: "201-500", value: "201-500" },
                        { label: "501-1000", value: "501-1000" },
                        { label: "1000+", value: "1000+" },
                      ]}
                    />
                    
                    <FilterCard
                      title="Revenue"
                      description="Filter by annual revenue"
                      icon={<DollarSign className="h-5 w-5" />}
                      onApply={(value) => addFilter({
                        id: `revenue-${Date.now()}`,
                        type: 'revenue',
                        label: 'Revenue',
                        value
                      })}
                      options={[
                        { label: "< 1M", value: "<1M" },
                        { label: "1M - 10M", value: "1M-10M" },
                        { label: "10M - 50M", value: "10M-50M" },
                        { label: "50M - 100M", value: "50M-100M" },
                        { label: "100M+", value: "100M+" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Active filters */}
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <div 
                key={filter.id}
                className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1.5 text-xs shadow-sm border border-primary/20"
              >
                <span className="font-medium">{filter.label}:</span>
                <span>{filter.value}</span>
                <button 
                  onClick={() => removeFilter(filter.id)}
                  className="text-primary hover:text-primary/80 ml-1 flex items-center justify-center rounded-full hover:bg-primary/20 h-4 w-4 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            {activeFilters.length > 0 && (
              <button 
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted/20 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 bg-background border-border/50 hover:bg-accent/20 transition-colors"
              >
                <Download className="h-4 w-4 text-primary/80" />
                <span>Export</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0 rounded-xl shadow-lg border-border/60" align="end">
              <ExportPanel 
                filters={{
                  industries: activeFilters
                    .filter(f => f.type === 'industry')
                    .map(f => f.value),
                  locations: activeFilters
                    .filter(f => f.type === 'location')
                    .map(f => f.value),
                  minEmployees: activeFilters
                    .filter(f => f.type === 'employees')
                    .map(f => {
                      const parts = f.value.split('-');
                      return parts[0];
                    })[0],
                  maxEmployees: activeFilters
                    .filter(f => f.type === 'employees')
                    .map(f => {
                      const parts = f.value.split('-');
                      return parts[1] || (f.value.includes('+') ? '100000' : parts[0]);
                    })[0],
                  minRevenue: activeFilters
                    .filter(f => f.type === 'revenue')
                    .map(f => {
                      if (f.value === '<1M') return '0';
                      if (f.value.includes('+')) return f.value.replace('M+', '000000');
                      return f.value.split('-')[0].replace('M', '000000');
                    })[0],
                  maxRevenue: activeFilters
                    .filter(f => f.type === 'revenue')
                    .map(f => {
                      if (f.value === '<1M') return '1000000';
                      if (f.value.includes('+')) return '999999999999';
                      return f.value.split('-')[1].replace('M', '000000');
                    })[0],
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {totalResults} results
        </div>
        <div className="relative w-64">
          <Input 
            placeholder="Search companies..." 
            className="pl-8 h-9 bg-background/50 border-border/50"
          />
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </div>
      </div>
    </div>
  )
}

// Filter card component
interface FilterCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onApply: (value: string) => void
  options?: { label: string; value: string }[]
}

function FilterCard({ title, description, icon, onApply, options }: FilterCardProps) {
  const [value, setValue] = useState("")
  
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow transition-shadow border-border/60">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="text-primary bg-primary/10 p-2 rounded-md">{icon}</div>
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        {options ? (
          <div className="space-y-2">
            <Select onValueChange={setValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {options.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          <Button 
            size="sm" 
            className="h-8 bg-sidebar text-sidebar-foreground hover:bg-sidebar/90 transition-colors duration-200"
            onClick={() => onApply(value)}
            disabled={!value}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Apply Filter
          </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Input 
              placeholder="Enter value..." 
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Button 
              size="sm" 
              className="w-full mt-1"
              onClick={() => value && onApply(value)}
              disabled={!value}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Apply Filter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// RGB border animation for CTA buttons
export function RgbBorderButton({ children, className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff0000] via-[#00ff00] to-[#0000ff] rounded-lg blur-[2px] opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-gradient"></div>
      <Button 
        className={`relative bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground transition-colors duration-200 ${className}`} 
        {...props}
      >
        {children}
      </Button>
    </div>
  )
}
