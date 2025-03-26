// src/components/company-detail.tsx
import { useState } from "react";
import { Company, Stakeholder } from "@/types/company";
import { updateCompany, addStakeholder } from "@/services/firestore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  Building2,
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  DollarSign, 
  Calendar,
  Plus,
  MoreHorizontal
} from "lucide-react";
import { RgbBorderButton } from "./filter-bar";

interface CompanyDetailProps {
  company: Company;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function CompanyDetail({ company, open, onClose, onUpdate }: CompanyDetailProps) {
  const [newStakeholder, setNewStakeholder] = useState<Partial<Stakeholder>>({
    name: "",
    role: "",
    email: "",
    phone: "",
  });
  const [isAddingStakeholder, setIsAddingStakeholder] = useState(false);

  const handleAddStakeholder = async () => {
    if (!newStakeholder.name || !newStakeholder.role) return;
    
    try {
      await addStakeholder(company.companyId, {
        id: "",
        name: newStakeholder.name || "",
        role: newStakeholder.role || "",
        email: newStakeholder.email,
        phone: newStakeholder.phone,
        notes: "",
        lastContactDate: new Date(),
      });
      
      setNewStakeholder({
        name: "",
        role: "",
        email: "",
        phone: "",
      });
      
      setIsAddingStakeholder(false);
      onUpdate();
    } catch (err) {
      console.error("Error adding stakeholder:", err);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        {/* Company header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{company.name}</h2>
                <p className="text-sm text-muted-foreground">{company.info?.naceCategories}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Mail className="h-4 w-4" />
                <span>Contact</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Globe className="h-4 w-4" />
                <span>Website</span>
              </Button>
              <RgbBorderButton size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                <span>Add to List</span>
              </RgbBorderButton>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b">
            <div className="px-6">
              <TabsList className="h-12">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="overview" className="p-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                {/* Company description */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Modern regional energy service provider for the city of {company.location.municipality} and the surrounding communities. 
                      We stand for customer proximity, fairness, professionalism and regionality and supply gas, water, heat and electricity in a 
                      sustainable, efficient and value-generating manner.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      <div className="bg-muted/50 text-xs px-2 py-1 rounded-md">
                        {company.info?.naceCategories?.split(' ')[0] || "Energy"}
                      </div>
                      <div className="bg-muted/50 text-xs px-2 py-1 rounded-md">
                        Utilities
                      </div>
                      <div className="bg-muted/50 text-xs px-2 py-1 rounded-md">
                        B2B
                      </div>
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
                    <CardDescription>
                      Last updated: {company.financials?.companyAccountsLastUpdatedDate || "2023"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Revenue</div>
                        <div className="text-2xl font-bold">
                          {company.financials?.revenue 
                            ? `${(Number(company.financials.revenue) / 1000000).toFixed(1)}M ${company.financials?.currency}`
                            : "N/A"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Profit</div>
                        <div className="text-2xl font-bold">
                          {company.financials?.profit 
                            ? `${(Number(company.financials.profit) / 1000000).toFixed(1)}M ${company.financials?.currency}`
                            : "N/A"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Employees</div>
                        <div className="text-2xl font-bold">
                          {company.info?.numberOfEmployees || "N/A"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                {/* Company details */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Company Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div className="text-muted-foreground">Founded</div>
                      <div>{company.info?.foundationDate || company.info?.foundationYear || "N/A"}</div>
                      
                      <div className="text-muted-foreground">Organization Number</div>
                      <div>{company.organisationNumber}</div>
                      
                      <div className="text-muted-foreground">Status</div>
                      <div>{company.info?.status?.status || "Active"}</div>
                      
                      <div className="text-muted-foreground">Industry</div>
                      <div>{company.info?.naceCategories?.split(' ')[0] || "Energy"}</div>
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
                      <div className="text-sm">{company.visitorAddress.addressLine}</div>
                      <div className="text-sm">{company.visitorAddress.zipCode} {company.visitorAddress.postPlace}</div>
                      <div className="text-sm">{company.location.municipality}, {company.location.county}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Contact</div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{company.contact?.telephoneNumber || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{company.contact?.email || "N/A"}</span>
                      </div>
                      {company.contact?.homePage && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          <a 
                            href={company.contact.homePage} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {company.contact.homePage.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="contacts" className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Stakeholders</h3>
              <Button size="sm" onClick={() => setIsAddingStakeholder(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Stakeholder
              </Button>
            </div>
            
            {company.stakeholders && company.stakeholders.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {company.stakeholders.map((stakeholder) => (
                  <Card key={stakeholder.id} className="overflow-hidden">
                    <CardHeader className="pb-2 bg-muted/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{stakeholder.name}</CardTitle>
                          <CardDescription>{stakeholder.role}</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
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
                    <CardFooter className="bg-muted/20 py-2 px-4 text-xs text-muted-foreground">
                      Last contacted: {stakeholder.lastContactDate?.toLocaleDateString() || "Never"}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">No stakeholders added yet</p>
                  <Button onClick={() => setIsAddingStakeholder(true)}>
                    Add Stakeholder
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {isAddingStakeholder && (
              <Dialog open={isAddingStakeholder} onOpenChange={setIsAddingStakeholder}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Stakeholder</DialogTitle>
                    <DialogDescription>
                      Add a new contact person for {company.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newStakeholder.name}
                        onChange={(e) => setNewStakeholder({...newStakeholder, name: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={newStakeholder.role}
                        onChange={(e) => setNewStakeholder({...newStakeholder, role: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStakeholder.email}
                        onChange={(e) => setNewStakeholder({...newStakeholder, email: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newStakeholder.phone}
                        onChange={(e) => setNewStakeholder({...newStakeholder, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingStakeholder(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddStakeholder}>Add Stakeholder</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>
          
          <TabsContent value="financials" className="p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Financial Information
                </CardTitle>
                <CardDescription>
                  Last updated: {company.financials?.companyAccountsLastUpdatedDate || "2023"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Revenue</div>
                    <div className="text-2xl font-bold">
                      {company.financials?.revenue 
                        ? `${(Number(company.financials.revenue) / 1000000).toFixed(1)}M ${company.financials?.currency}`
                        : "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Profit</div>
                    <div className="text-2xl font-bold">
                      {company.financials?.profit 
                        ? `${(Number(company.financials.profit) / 1000000).toFixed(1)}M ${company.financials?.currency}`
                        : "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Employees</div>
                    <div className="text-2xl font-bold">
                      {company.info?.numberOfEmployees || "N/A"}
                    </div>
                  </div>
                </div>
                
                <div className="h-64 bg-muted/30 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Financial charts coming soon</p>
                    <p className="text-xs text-muted-foreground/70">
                      Historical financial data will be available in a future update
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notes" className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Company Notes</Label>
                    <textarea
                      id="notes"
                      className="w-full min-h-[200px] p-2 border rounded-md bg-background"
                      placeholder="Add notes about this company..."
                    />
                  </div>
                  <Button>Save Notes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
