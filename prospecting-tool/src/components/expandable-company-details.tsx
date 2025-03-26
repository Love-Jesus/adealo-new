import { Company, Stakeholder } from "@/types/company";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  DollarSign,
  Calendar,
  ChevronUp,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExpandableCompanyDetailsProps {
  company: Company;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ExpandableCompanyDetails({ 
  company, 
  isExpanded, 
  onToggle 
}: ExpandableCompanyDetailsProps) {
  if (!isExpanded) {
    return null;
  }

  // Helper function to extract industry name from naceCategories
  const extractIndustry = (naceCategories?: string): string => {
    if (!naceCategories) return 'N/A';
    try {
      // Format might be like "71124 Teknisk konsultverksamhet inom energi-, miljö- och VVS-teknik"
      // Or it might contain multiple categories separated by |
      // Take the first category if there are multiple
      const firstCategory = naceCategories.split('|')[0];
      // Extract everything after the first space
      const parts = firstCategory.split(' ');
      return parts.slice(1).join(' ');
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="px-4 py-3 bg-muted/20 border-t border-border/30 animate-in fade-in duration-200">
      <Tabs defaultValue="overview" className="w-full">
        <div className="mb-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              {/* Company description */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {(company.info?.naceCategories || (company as any).naceCategories) 
                      ? `Company operating in ${extractIndustry(company.info?.naceCategories || (company as any).naceCategories)}.` 
                      : 'No company description available.'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {/* Industry code badge */}
                    <Badge variant="secondary">
                      {(company.info?.naceCategories || (company as any).naceCategories)?.split('|')[0]?.split(' ')[0] || "N/A"}
                    </Badge>
                    
                    {/* Proff industries badge */}
                    {(company.info?.proffIndustries || (company as any).proffIndustries) && (
                      <Badge variant="secondary">
                        {company.info?.proffIndustries || (company as any).proffIndustries}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Financial highlights */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financial Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Revenue</div>
                      <div className="text-xl font-bold">
                        {company.financials?.revenue !== undefined
                          ? `${(Number(company.financials.revenue) / 1000000).toFixed(1)}M ${company.financials?.currency || 'SEK'}`
                          : (company as any).revenue !== undefined
                            ? `${(Number((company as any).revenue) / 1000000).toFixed(1)}M SEK`
                            : "N/A"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Profit</div>
                      <div className="text-xl font-bold">
                        {company.financials?.profit !== undefined
                          ? `${(Number(company.financials.profit) / 1000000).toFixed(1)}M ${company.financials?.currency || 'SEK'}`
                          : (company as any).profit !== undefined
                            ? `${(Number((company as any).profit) / 1000000).toFixed(1)}M SEK`
                            : "N/A"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Employees</div>
                      <div className="text-xl font-bold">
                        {company.info?.numberOfEmployees || 
                         (company as any).numberOfEmployees || 
                         (company as any).employees || 
                         "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              {/* Company details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Company Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div className="text-muted-foreground">Founded</div>
                    <div>{company.info?.foundationDate || 
                          company.info?.foundationYear || 
                          (company as any).foundationDate || 
                          (company as any).foundationYear || "N/A"}</div>
                    
                    <div className="text-muted-foreground">Organization Number</div>
                    <div>{company.organisationNumber || "N/A"}</div>
                    
                    <div className="text-muted-foreground">Status</div>
                    <div>{company.info?.status?.status || 
                          (company as any).status_status || 
                          (company as any).status || "Active"}</div>
                    
                    <div className="text-muted-foreground">Industry</div>
                    <div>{(company.info?.naceCategories || (company as any).naceCategories)?.split('|')[0]?.split(' ')[0] || "N/A"}</div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Contact information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Address</div>
                    <div className="text-sm">
                      {company.visitorAddress?.addressLine || 
                       (company as any).visitorAddress_addressLine || 
                       company.postalAddress?.addressLine || 
                       (company as any).postalAddress_addressLine || 
                       (company as any).address || 
                       (company as any).addressLine || 
                       'N/A'}
                    </div>
                    <div className="text-sm">
                      {company.visitorAddress?.zipCode || 
                       (company as any).visitorAddress_zipCode || 
                       company.postalAddress?.zipCode || 
                       (company as any).postalAddress_zipCode || 
                       (company as any).zipCode || 'N/A'}{' '}
                      {company.visitorAddress?.postPlace || 
                       (company as any).visitorAddress_postPlace || 
                       company.postalAddress?.postPlace || 
                       (company as any).postalAddress_postPlace || 
                       (company as any).postPlace || ''}
                    </div>
                    <div className="text-sm">
                      {company.location?.municipality || 
                       (company as any).location_municipality || 
                       (company as any).municipality || 'N/A'}
                      {(company.location?.county || 
                        (company as any).location_county || 
                        (company as any).county) ? 
                        `, ${company.location?.county || 
                             (company as any).location_county || 
                             (company as any).county}` : ''}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Contact</div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{company.contact?.telephoneNumber || 
                             (company as any).telephoneNumber || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{company.contact?.email || 
                             (company as any).email || "N/A"}</span>
                    </div>
                    
                    {/* Company Website Link */}
                    {(company.contact?.homePage || (company as any).homePage) && (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          <a 
                            href={company.contact?.homePage || (company as any).homePage} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {(company.contact?.homePage || (company as any).homePage).replace(/^https?:\/\//, '')}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        
                        {/* Prominent Website Button */}
                        <div className="mt-3">
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => window.open(company.contact?.homePage || (company as any).homePage, '_blank')}
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            Visit Company Website
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="contacts" className="mt-0">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Stakeholders</h3>
              <Button size="sm">
                Add Stakeholder
              </Button>
            </div>
            
            {company.stakeholders && company.stakeholders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.stakeholders.map((stakeholder) => (
                  <Card key={stakeholder.id}>
                    <CardHeader className="pb-2 bg-muted/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{stakeholder.name}</CardTitle>
                          <div className="text-sm text-muted-foreground">{stakeholder.role}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {stakeholder.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{stakeholder.email}</span>
                          </div>
                        )}
                        {stakeholder.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{stakeholder.phone}</span>
                          </div>
                        )}
                        {stakeholder.notes && (
                          <div className="mt-3 pt-3 border-t text-sm">
                            <div className="text-muted-foreground mb-1">Notes</div>
                            <p>{stakeholder.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Users className="h-10 w-10 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">No stakeholders added yet</p>
                  <Button>
                    Add Stakeholder
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="financials" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Revenue</div>
                  <div className="text-2xl font-bold">
                    {company.financials?.revenue !== undefined
                      ? `${(Number(company.financials.revenue) / 1000000).toFixed(1)}M ${company.financials?.currency || 'SEK'}`
                      : (company as any).revenue !== undefined
                        ? `${(Number((company as any).revenue) / 1000000).toFixed(1)}M SEK`
                        : "N/A"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Profit</div>
                  <div className="text-2xl font-bold">
                    {company.financials?.profit !== undefined
                      ? `${(Number(company.financials.profit) / 1000000).toFixed(1)}M ${company.financials?.currency || 'SEK'}`
                      : (company as any).profit !== undefined
                        ? `${(Number((company as any).profit) / 1000000).toFixed(1)}M SEK`
                        : "N/A"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Employees</div>
                  <div className="text-2xl font-bold">
                    {company.info?.numberOfEmployees || 
                     (company as any).numberOfEmployees || 
                     (company as any).employees || 
                     "N/A"}
                  </div>
                </div>
              </div>
              
              <div className="h-48 bg-muted/30 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Financial charts coming soon</p>
                  <p className="text-xs text-muted-foreground/70">
                    Historical financial data will be available in a future update
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center mt-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggle}
          className="flex items-center gap-1"
        >
          <ChevronUp className="h-4 w-4" />
          <span>Collapse</span>
        </Button>
      </div>
    </div>
  );
}
