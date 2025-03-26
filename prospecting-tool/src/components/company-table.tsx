"use client"

import { useState } from "react"
import { Company } from "@/types/company"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  MoreHorizontal,
  ExternalLink,
  Users,
  DollarSign,
  MapPin
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RgbBorderButton } from "./filter-bar"

interface CompanyTableProps {
  companies: Company[]
  onSelectCompany: (companyId: string) => void
  onSelectCompanies: (companyIds: string[]) => void
}

export function CompanyTable({ companies, onSelectCompany, onSelectCompanies }: CompanyTableProps) {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  
  // Handle row selection
  const toggleRowSelection = (companyId: string) => {
    setSelectedCompanies(prev => {
      const isSelected = prev.includes(companyId)
      const newSelection = isSelected
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
      
      // Notify parent component
      onSelectCompanies(newSelection)
      return newSelection
    })
  }
  
  // Handle select all
  const toggleSelectAll = () => {
    if (selectedCompanies.length === companies.length) {
      setSelectedCompanies([])
      onSelectCompanies([])
    } else {
      const allIds = companies.map(company => company.companyId)
      setSelectedCompanies(allIds)
      onSelectCompanies(allIds)
    }
  }
  
  return (
    <div className="space-y-4 w-full">
      <div className="rounded-xl border shadow-sm overflow-hidden bg-card w-full">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-muted/20 border-b border-border/40">
              <TableHead className="w-12 h-11">
                <Checkbox 
                  checked={
                    companies.length > 0 && 
                    selectedCompanies.length === companies.length
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="font-medium text-sm">Company</TableHead>
              <TableHead className="font-medium text-sm">Location</TableHead>
              <TableHead className="font-medium text-sm">Industry</TableHead>
              <TableHead className="font-medium text-sm">Employees</TableHead>
              <TableHead className="font-medium text-sm">Revenue</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map(company => (
              <TableRow 
                key={company.companyId}
                className={`${selectedCompanies.includes(company.companyId) ? "bg-primary/5" : ""} hover:bg-muted/10 transition-colors duration-150 border-b border-border/20`}
              >
                <TableCell className="py-3">
                  <Checkbox 
                    checked={selectedCompanies.includes(company.companyId)}
                    onCheckedChange={() => toggleRowSelection(company.companyId)}
                    aria-label={`Select ${company.name}`}
                  />
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary shadow-sm">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div 
                        className="font-medium hover:text-primary cursor-pointer transition-colors"
                        onClick={() => onSelectCompany(company.companyId)}
                      >
                        {company.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {company.organisationNumber}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4 flex items-center justify-center">
                      <img 
                        src={`https://flagcdn.com/w20/de.png`} 
                        alt="DE" 
                        className="max-w-full max-h-full shadow-sm"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {company.location.municipality || 
                        company.location.county || 
                        company.postalAddress.postPlace}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <span className="px-2 py-1 bg-muted/40 rounded-md text-sm">
                    {company.info?.naceCategories?.split(' ')[0] || "N/A"}
                  </span>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{company.info?.numberOfEmployees || "N/A"}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">
                      {company.financials?.revenue 
                        ? `${(Number(company.financials.revenue) / 1000000).toFixed(1)}M ${company.financials.currency}`
                        : "N/A"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 rounded-lg">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem 
                        onClick={() => onSelectCompany(company.companyId)}
                        className="cursor-pointer"
                      >
                        <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                        View company details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        Add to list
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {company.contact?.homePage && (
                        <DropdownMenuItem className="cursor-pointer">
                          <a 
                            href={company.contact.homePage} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 w-full"
                          >
                            <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
                            Visit website
                          </a>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            
            {companies.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Building2 className="h-8 w-8 mb-2 opacity-40" />
                    <p>No companies found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Selection info */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Building2 className="h-4 w-4" />
          Showing {companies.length} companies
        </div>
        <div className="flex items-center gap-3">
          {selectedCompanies.length > 0 && (
            <RgbBorderButton 
              size="sm"
              className="h-9"
              onClick={() => {
                // Handle bulk action
                console.log("Bulk action on:", selectedCompanies)
              }}
            >
              Add {selectedCompanies.length} to list
            </RgbBorderButton>
          )}
        </div>
      </div>
    </div>
  )
}
