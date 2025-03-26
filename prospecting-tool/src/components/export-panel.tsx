import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ExportPanelProps {
  filters: Record<string, any>;
}

interface FieldOption {
  value: string;
  label: string;
  category: string;
}

const fieldCategories = [
  {
    name: 'Basic Info',
    fields: [
      { value: 'name', label: 'Company Name' },
      { value: 'organisationNumber', label: 'Organization Number' },
      { value: 'displayName', label: 'Display Name' },
    ]
  },
  {
    name: 'Address',
    fields: [
      { value: 'visitorAddress.addressLine', label: 'Visitor Address' },
      { value: 'visitorAddress.zipCode', label: 'Visitor Zip Code' },
      { value: 'visitorAddress.postPlace', label: 'Visitor City' },
      { value: 'postalAddress.addressLine', label: 'Postal Address' },
      { value: 'postalAddress.zipCode', label: 'Postal Zip Code' },
      { value: 'postalAddress.postPlace', label: 'Postal City' },
    ]
  },
  {
    name: 'Contact',
    fields: [
      { value: 'contact.email', label: 'Email' },
      { value: 'contact.telephoneNumber', label: 'Phone' },
      { value: 'contact.mobilePhone', label: 'Mobile Phone' },
      { value: 'contact.faxNumber', label: 'Fax' },
      { value: 'contact.homePage', label: 'Website' },
    ]
  },
  {
    name: 'Location',
    fields: [
      { value: 'location.countryPart', label: 'Country Part' },
      { value: 'location.county', label: 'County' },
      { value: 'location.municipality', label: 'Municipality' },
    ]
  },
  {
    name: 'Financials',
    fields: [
      { value: 'financials.revenue', label: 'Revenue' },
      { value: 'financials.profit', label: 'Profit' },
      { value: 'financials.currency', label: 'Currency' },
      { value: 'financials.companyAccountsLastUpdatedDate', label: 'Last Updated Date' },
    ]
  },
  {
    name: 'Company Info',
    fields: [
      { value: 'info.foundationYear', label: 'Foundation Year' },
      { value: 'info.foundationDate', label: 'Foundation Date' },
      { value: 'info.numberOfEmployees', label: 'Number of Employees' },
      { value: 'info.status.status', label: 'Status' },
      { value: 'info.naceCategories', label: 'NACE Categories' },
      { value: 'info.proffIndustries', label: 'Industries' },
    ]
  },
  {
    name: 'Roles',
    fields: [
      { value: 'roles.companyRoles', label: 'Company Roles' },
      { value: 'roles.personRoles', label: 'Person Roles' },
    ]
  },
];

// Flatten field categories for search
const allFields: FieldOption[] = fieldCategories.flatMap(category => 
  category.fields.map(field => ({
    ...field,
    category: category.name
  }))
);

export function ExportPanel({ filters }: ExportPanelProps) {
  const [format, setFormat] = useState('csv');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'name', 'organisationNumber', 'contact.email', 'financials.revenue'
  ]);
  const [exportId, setExportId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<any>(null);
  const [fieldSearch, setFieldSearch] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [activeTab, setActiveTab] = useState('fields');
  
  // Filter fields based on search
  const filteredFields = fieldSearch 
    ? allFields.filter(field => 
        field.label.toLowerCase().includes(fieldSearch.toLowerCase()) ||
        field.category.toLowerCase().includes(fieldSearch.toLowerCase())
      )
    : allFields;
  
  // Get preview count
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  
  useEffect(() => {
    const fetchPreview = async () => {
      if (!filters || Object.keys(filters).length === 0) {
        setPreviewCount(null);
        return;
      }
      
      setIsLoadingPreview(true);
      try {
        const getPreview = httpsCallable(functions, 'getExportPreview');
        const result = await getPreview({ filters });
        setPreviewCount((result.data as any).count);
      } catch (error) {
        console.error('Error fetching preview:', error);
        setPreviewCount(null);
      } finally {
        setIsLoadingPreview(false);
      }
    };
    
    fetchPreview();
  }, [filters]);
  
  // Poll export status if an export is in progress
  useEffect(() => {
    if (!exportId || isPolling) return;
    
    const pollStatus = async () => {
      setIsPolling(true);
      
      try {
        const getStatus = httpsCallable(functions, 'getExportStatus');
        const result = await getStatus({ exportId });
        const status = result.data as any;
        
        setExportStatus(status);
        
        if (status.status === 'processing') {
          // Continue polling
          setTimeout(pollStatus, 2000);
        } else {
          setIsPolling(false);
          
          // If completed, open download in new tab
          if (status.status === 'completed' && status.downloadUrl) {
            window.open(status.downloadUrl, '_blank');
          }
        }
      } catch (error) {
        console.error('Error polling export status:', error);
        setIsPolling(false);
      }
    };
    
    pollStatus();
  }, [exportId, isPolling]);
  
  // Start export
  const startExport = async () => {
    if (selectedFields.length === 0) return;
    
    try {
      const initiateExport = httpsCallable(functions, 'initiateExport');
      const result = await initiateExport({
        filters,
        format,
        fields: selectedFields
      });
      
      setExportId((result.data as any).exportId);
      setActiveTab('status');
    } catch (error) {
      console.error('Export error:', error);
      // Show error notification
    }
  };
  
  // Toggle field selection
  const toggleField = (field: string) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };
  
  // Select all fields in a category
  const selectCategory = (categoryName: string) => {
    const categoryFields = fieldCategories
      .find(cat => cat.name === categoryName)?.fields
      .map(field => field.value) || [];
    
    const newSelectedFields = [...selectedFields];
    
    categoryFields.forEach(field => {
      if (!newSelectedFields.includes(field)) {
        newSelectedFields.push(field);
      }
    });
    
    setSelectedFields(newSelectedFields);
  };
  
  // Deselect all fields in a category
  const deselectCategory = (categoryName: string) => {
    const categoryFields = fieldCategories
      .find(cat => cat.name === categoryName)?.fields
      .map(field => field.value) || [];
    
    setSelectedFields(selectedFields.filter(field => !categoryFields.includes(field)));
  };
  
  // Check if all fields in a category are selected
  const isCategorySelected = (categoryName: string) => {
    const categoryFields = fieldCategories
      .find(cat => cat.name === categoryName)?.fields
      .map(field => field.value) || [];
    
    return categoryFields.every(field => selectedFields.includes(field));
  };
  
  // Check if some fields in a category are selected
  const isCategoryPartiallySelected = (categoryName: string) => {
    const categoryFields = fieldCategories
      .find(cat => cat.name === categoryName)?.fields
      .map(field => field.value) || [];
    
    return categoryFields.some(field => selectedFields.includes(field)) && 
           !categoryFields.every(field => selectedFields.includes(field));
  };
  
  // Quick selection buttons
  const selectAll = () => {
    setSelectedFields(allFields.map(field => field.value));
  };
  
  const deselectAll = () => {
    setSelectedFields([]);
  };
  
  const selectBasicInfo = () => {
    setSelectedFields([
      'name', 'organisationNumber', 'contact.email', 'contact.telephoneNumber'
    ]);
  };
  
  const selectFinancials = () => {
    setSelectedFields([
      'name', 'financials.revenue', 'financials.profit', 'info.numberOfEmployees'
    ]);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Export Companies</CardTitle>
        <CardDescription>
          {isLoadingPreview ? (
            'Loading preview...'
          ) : previewCount !== null ? (
            `${previewCount} companies match your filters`
          ) : (
            'No companies match your filters'
          )}
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="status">Export Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fields">
          <CardContent>
            {/* Format selection */}
            <div className="mb-4">
              <Label htmlFor="format">Export Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger 
                  disabled={!!exportId && exportStatus?.status === 'processing'}
                >
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Quick selection buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={selectAll}
                disabled={!!exportId && exportStatus?.status === 'processing'}
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={deselectAll}
                disabled={!!exportId && exportStatus?.status === 'processing'}
              >
                Clear All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={selectBasicInfo}
                disabled={!!exportId && exportStatus?.status === 'processing'}
              >
                Basic Contact Info
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={selectFinancials}
                disabled={!!exportId && exportStatus?.status === 'processing'}
              >
                Financial Info
              </Button>
            </div>
            
            {/* Field search */}
            <div className="mb-4">
              <Label htmlFor="field-search">Search Fields</Label>
              <input
                id="field-search"
                type="text"
                placeholder="Search fields..."
                value={fieldSearch}
                onChange={(e) => setFieldSearch(e.target.value)}
                className="w-full p-2 border rounded"
                disabled={!!exportId && exportStatus?.status === 'processing'}
              />
            </div>
            
            {/* Field selection */}
            <div className="max-h-60 overflow-y-auto border rounded p-2">
              {fieldSearch ? (
                // Search results
                filteredFields.map(field => (
                  <div key={field.value} className="flex items-center mb-1">
                    <Checkbox
                      id={`field-${field.value}`}
                      checked={selectedFields.includes(field.value)}
                      onCheckedChange={() => toggleField(field.value)}
                      disabled={!!exportId && exportStatus?.status === 'processing'}
                    />
                    <label htmlFor={`field-${field.value}`} className="ml-2 text-sm">
                      {field.label} <span className="text-xs text-gray-500">({field.category})</span>
                    </label>
                  </div>
                ))
              ) : (
                // Categorized fields
                fieldCategories.map(category => (
                  <div key={category.name} className="mb-3">
                    <div className="flex items-center mb-1">
                      <div className="relative flex items-center">
                        <Checkbox
                          id={`category-${category.name}`}
                          checked={isCategorySelected(category.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              selectCategory(category.name);
                            } else {
                              deselectCategory(category.name);
                            }
                          }}
                          disabled={!!exportId && exportStatus?.status === 'processing'}
                        />
                        {isCategoryPartiallySelected(category.name) && (
                          <div className="absolute left-[7px] top-1/2 h-[2px] w-[10px] -translate-y-1/2 bg-current" />
                        )}
                      </div>
                      <label htmlFor={`category-${category.name}`} className="ml-2 font-medium">
                        {category.name}
                      </label>
                    </div>
                    
                    <div className="ml-6">
                      {category.fields.map(field => (
                        <div key={field.value} className="flex items-center mb-1">
                          <Checkbox
                            id={`field-${field.value}`}
                            checked={selectedFields.includes(field.value)}
                            onCheckedChange={() => toggleField(field.value)}
                            disabled={!!exportId && exportStatus?.status === 'processing'}
                          />
                          <label htmlFor={`field-${field.value}`} className="ml-2 text-sm">
                            {field.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="status">
          <CardContent>
            {exportStatus ? (
              <div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Status: {exportStatus.status}</span>
                    <span>{exportStatus.progress || 0}%</span>
                  </div>
                  <Progress value={exportStatus.progress || 0} />
                </div>
                
                {exportStatus.status === 'completed' && exportStatus.downloadUrl && (
                  <div className="mb-4">
                    <a 
                      href={exportStatus.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Download Export
                    </a>
                  </div>
                )}
                
                {exportStatus.status === 'failed' && (
                  <div className="mb-4 text-red-500">
                    Export failed: {exportStatus.error || 'Unknown error'}
                  </div>
                )}
                
                <div className="text-sm text-gray-500">
                  {exportStatus.totalRecords} records total
                  {exportStatus.createdAt && (
                    <div>Started: {new Date(exportStatus.createdAt.seconds * 1000).toLocaleString()}</div>
                  )}
                  {exportStatus.completedAt && (
                    <div>Completed: {new Date(exportStatus.completedAt.seconds * 1000).toLocaleString()}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No active exports. Start an export to see status here.
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter>
        <Button
          onClick={startExport}
          disabled={
            !previewCount || 
            selectedFields.length === 0 || 
            (!!exportId && exportStatus?.status === 'processing')
          }
          className="w-full"
        >
          {!!exportId && exportStatus?.status === 'processing' 
            ? 'Exporting...' 
            : 'Export Companies'}
        </Button>
      </CardFooter>
    </Card>
  );
}
