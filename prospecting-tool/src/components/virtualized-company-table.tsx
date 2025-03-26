import { useState, useRef, useEffect, useMemo } from "react";
import { Company } from "@/types/company";
import { VariableSizeList as List } from "react-window";
import { ExpandableCompanyDetails } from "@/components/expandable-company-details";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  MoreHorizontal,
  ExternalLink,
  Users,
  ChevronDown,
  ChevronUp,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RgbBorderButton } from "./filter-bar";

interface VirtualizedCompanyTableProps {
  companies: Company[];
  onSelectCompany: (companyId: string) => void;
  onSelectCompanies: (companyIds: string[]) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export function VirtualizedCompanyTable({ 
  companies, 
  onSelectCompany, 
  onSelectCompanies,
  onLoadMore,
  hasMore = false,
  loadingMore = false
}: VirtualizedCompanyTableProps) {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [expandedCompanyIds, setExpandedCompanyIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const tableRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const [tableWidth, setTableWidth] = useState(0);
  const [tableHeight, setTableHeight] = useState(0);
  
  // Update table dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (tableRef.current) {
        setTableWidth(tableRef.current.offsetWidth);
        // Set a fixed height or calculate based on viewport
        setTableHeight(Math.min(600, window.innerHeight - 300));
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // Handle row selection
  const toggleRowSelection = (companyId: string) => {
    setSelectedCompanies(prev => {
      const isSelected = prev.includes(companyId);
      const newSelection = isSelected
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId];
      
      // Notify parent component
      onSelectCompanies(newSelection);
      
      // Show toast notification when adding a company
      if (!isSelected) {
        const company = companies.find(c => c.companyId === companyId);
        if (company) {
          // Show a toast notification
          const toast = document.createElement('div');
          toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-in fade-in slide-in-from-bottom-5';
          toast.textContent = `Added ${company.name} to selection`;
          document.body.appendChild(toast);
          setTimeout(() => {
            toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-5');
            setTimeout(() => document.body.removeChild(toast), 300);
          }, 3000);
        }
      }
      
      return newSelection;
    });
  };
  
  // Handle select all
  const toggleSelectAll = () => {
    if (selectedCompanies.length === companies.length) {
      setSelectedCompanies([]);
      onSelectCompanies([]);
    } else {
      const allIds = companies.map(company => company.companyId);
      setSelectedCompanies(allIds);
      onSelectCompanies(allIds);
    }
  };
  
  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Helper function to extract industry name from naceCategories
  const extractIndustry = (naceCategories?: string): string => {
    if (!naceCategories) return '';
    try {
      // Format is like "71124 Teknisk konsultverksamhet inom energi-, miljö- och VVS-teknik"
      // Extract everything after the first space
      const parts = naceCategories.split(' ');
      return parts.slice(1).join(' ');
    } catch (e) {
      return '';
    }
  };
  
  // Sort companies
  const sortedCompanies = [...companies].sort((a, b) => {
    if (!sortField) return 0;
    
    let valueA, valueB;
    
    switch (sortField) {
      case 'name':
        valueA = a.name || '';
        valueB = b.name || '';
        break;
      case 'location':
        // Handle both nested and flattened data structures
        valueA = a.location?.municipality || 
                a.location?.county || 
                (a as any).location_municipality || 
                (a as any).location_county || 
                '';
        valueB = b.location?.municipality || 
                b.location?.county || 
                (b as any).location_municipality || 
                (b as any).location_county || 
                '';
        break;
      case 'industry':
        // Handle both nested and flattened data structures
        valueA = extractIndustry(a.info?.naceCategories || (a as any).naceCategories);
        valueB = extractIndustry(b.info?.naceCategories || (b as any).naceCategories);
        break;
      case 'employees':
        // Handle both nested and flattened data structures
        valueA = a.info?.numberOfEmployees 
                ? parseInt(a.info.numberOfEmployees) 
                : (a as any).numberOfEmployees 
                  ? parseInt((a as any).numberOfEmployees) 
                  : 0;
        valueB = b.info?.numberOfEmployees 
                ? parseInt(b.info.numberOfEmployees) 
                : (b as any).numberOfEmployees 
                  ? parseInt((b as any).numberOfEmployees) 
                  : 0;
        break;
      case 'revenue':
        // Revenue is in TKR (thousands of SEK)
        // Handle both nested and flattened data structures
        valueA = a.financials?.revenue !== undefined 
                ? Number(a.financials.revenue) 
                : (a as any).revenue !== undefined 
                  ? Number((a as any).revenue) 
                  : 0;
        valueB = b.financials?.revenue !== undefined 
                ? Number(b.financials.revenue) 
                : (b as any).revenue !== undefined 
                  ? Number((b as any).revenue) 
                  : 0;
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Toggle expanded state for a company
  const toggleExpandCompany = (companyId: string) => {
    setExpandedCompanyIds(prev => {
      const isExpanded = prev.includes(companyId);
      
      // If this company is already expanded, collapse it
      // Otherwise, collapse any currently expanded company and expand this one
      const newExpanded = isExpanded
        ? [] // Collapse all
        : [companyId]; // Only expand the clicked company
      
      // Force the list to recalculate row heights
      if (listRef.current) {
        listRef.current.resetAfterIndex(0);
      }
      
      return newExpanded;
    });
  };
  
  // Get row height based on expanded state
  const getRowHeight = (index: number) => {
    if (index >= sortedCompanies.length) {
      return 60; // Height for the "Load More" row
    }
    
    const company = sortedCompanies[index];
    return expandedCompanyIds.includes(company.companyId) ? 700 : 60; // Increased height for expanded rows
  };
  
  // Row renderer for virtualized list
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    if (index >= sortedCompanies.length) {
      // This is the loading more row
      return (
        <div style={style} className="flex items-center justify-center py-4">
          {loadingMore ? (
            <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent"></div>
          ) : hasMore ? (
            <Button 
              onClick={onLoadMore} 
              variant="outline" 
              size="sm"
            >
              Load More
            </Button>
          ) : null}
        </div>
      );
    }
    
    const company = sortedCompanies[index];
    
    return (
      <div style={style}>
        <TableRow 
          key={company.companyId}
          className={`${selectedCompanies.includes(company.companyId) ? "bg-primary/5 border-l-2 border-l-primary shadow-sm" : ""} 
                     ${expandedCompanyIds.includes(company.companyId) ? "border-b-0" : ""} 
                     cursor-pointer hover:bg-white/5 transition-colors duration-150`}
          onClick={() => toggleExpandCompany(company.companyId)}
        >
          <TableCell className="py-2 w-[40px]" onClick={(e) => e.stopPropagation()}>
            <Checkbox 
              checked={selectedCompanies.includes(company.companyId)}
              onCheckedChange={() => toggleRowSelection(company.companyId)}
              aria-label={`Select ${company.name}`}
            />
          </TableCell>
          <TableCell className="py-2 w-[300px]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div 
                  className="font-medium hover:text-primary cursor-pointer truncate max-w-[220px]"
                  onClick={() => toggleExpandCompany(company.companyId)}
                  title={company.name || ""}
                >
                  {company.name || "Unnamed Company"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {company.organisationNumber || "N/A"}
                </div>
              </div>
            </div>
          </TableCell>
          <TableCell className="py-2 w-[200px]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 flex items-center justify-center">
                <img 
                  src={`https://flagcdn.com/w20/se.png`} 
                  alt="SE" 
                  className="max-w-full max-h-full"
                />
              </div>
              <span className="truncate max-w-[160px]" title={
                company.location?.municipality || 
                company.location?.county || 
                (company as any).location_municipality || 
                (company as any).location_county || 
                (company.postalAddress && company.postalAddress.postPlace) ||
                ((company as any).postalAddress_postPlace) ||
                "N/A"
              }>
                {/* Handle both nested and flattened data structures */}
                {company.location?.municipality || 
                company.location?.county || 
                (company as any).location_municipality || 
                (company as any).location_county || 
                (company.postalAddress && company.postalAddress.postPlace) ||
                ((company as any).postalAddress_postPlace) ||
                "N/A"}
              </span>
            </div>
          </TableCell>
          <TableCell className="py-2 w-[150px]">
            {/* Handle both nested and flattened data structures */}
            <div className="truncate max-w-[150px]" title={(company.info?.naceCategories || (company as any).naceCategories)
              ? extractIndustry(company.info?.naceCategories || (company as any).naceCategories)
              : "N/A"}>
              {(company.info?.naceCategories || (company as any).naceCategories)
                ? extractIndustry(company.info?.naceCategories || (company as any).naceCategories)
                : "N/A"}
            </div>
          </TableCell>
          <TableCell className="py-2 w-[120px]">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              {/* Handle both nested and flattened data structures */}
              <span>
                {company.info?.numberOfEmployees !== undefined 
                  ? company.info.numberOfEmployees 
                  : (company as any).numberOfEmployees !== undefined 
                    ? (company as any).numberOfEmployees 
                    : "N/A"}
              </span>
            </div>
          </TableCell>
          <TableCell className="py-2 w-[120px]">
            <div className="font-medium">
              {/* Handle both nested and flattened data structures */}
              {company.financials?.revenue !== undefined
                ? `${(Number(company.financials.revenue) / 1000).toFixed(2)}M SEK`
                : (company as any).revenue !== undefined
                  ? `${(Number((company as any).revenue) / 1000).toFixed(2)}M SEK`
                  : "N/A"}
            </div>
          </TableCell>
          <TableCell className="py-2 w-[60px]" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toggleExpandCompany(company.companyId)}>
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  toggleRowSelection(company.companyId);
                  // Show a toast notification
                  const toast = document.createElement('div');
                  toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-in fade-in slide-in-from-bottom-5';
                  toast.textContent = `Added ${company.name} to selection`;
                  document.body.appendChild(toast);
                  setTimeout(() => {
                    toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-5');
                    setTimeout(() => document.body.removeChild(toast), 300);
                  }, 3000);
                }}>
                  Add to selection
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(company.contact?.homePage || (company as any).homePage) && (
                  <DropdownMenuItem>
                    <a 
                      href={company.contact?.homePage || (company as any).homePage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full"
                    >
                      Visit website
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        
        {/* Expandable details section */}
        {expandedCompanyIds.includes(company.companyId) && (
          <ExpandableCompanyDetails 
            company={company}
            isExpanded={expandedCompanyIds.includes(company.companyId)}
            onToggle={() => toggleExpandCompany(company.companyId)}
          />
        )}
      </div>
    );
  };
  
  // Render sortable header
  const SortableHeader = ({ field, children }: { field: string, children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="h-3 w-3" /> : 
            <ChevronDown className="h-3 w-3" />
        )}
      </div>
    </TableHead>
  );
  
  return (
    <div className="space-y-4 w-full" ref={tableRef}>
      <div className="rounded-xl border shadow-sm overflow-hidden bg-card w-full">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-muted/20">
              <TableHead className="w-[40px] h-10" onClick={(e) => e.stopPropagation()}>
                <Checkbox 
                  checked={
                    companies.length > 0 && 
                    selectedCompanies.length === companies.length
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <SortableHeader field="name">Company</SortableHeader>
              <SortableHeader field="location">Location</SortableHeader>
              <SortableHeader field="industry">Industry</SortableHeader>
              <SortableHeader field="employees">Employees</SortableHeader>
              <SortableHeader field="revenue">Revenue</SortableHeader>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        
        {companies.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground">
            No companies found.
          </div>
        ) : (
          <div className="overflow-hidden">
            <List
              ref={listRef}
              height={tableHeight}
              width={tableWidth || '100%'}
              itemCount={hasMore ? sortedCompanies.length + 1 : sortedCompanies.length}
              itemSize={getRowHeight}
              overscanCount={5}
            >
              {Row}
            </List>
          </div>
        )}
      </div>
      
      {/* Selection info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {companies.length} companies
        </div>
      </div>
    </div>
  );
}
