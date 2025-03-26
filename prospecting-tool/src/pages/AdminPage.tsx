// src/pages/AdminPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  uploadImportFile, 
  uploadLargeImportFile,
  UploadProgress, 
  validateImportFile, 
  listUserImports, 
  deleteImport,
  ImportRecord
} from "@/services/storage";
import {
  importFileDirectly,
  ImportProgress as DirectImportProgress
} from "@/services/directImport";
import { ImportProgress } from "@/components/import-progress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Upload, 
  LogOut, 
  Users, 
  Database, 
  Shield, 
  Trash2, 
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  X
} from "lucide-react";
import { auth, getUserRole, updateUserRole, testFirebaseStorage } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserData, getUsers } from "@/services/firestore";
import { getSupportSettings, updateSupportSettings } from "@/services/support";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function AdminPage() {
  const navigate = useNavigate();
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{name: string, size: string} | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [importId, setImportId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("import");
  const [supportChatEnabled, setSupportChatEnabled] = useState(false);
  const [isSavingSupportSettings, setIsSavingSupportSettings] = useState(false);
  
  // Load support settings
  useEffect(() => {
    if (activeTab === "support") {
      loadSupportSettings();
    }
  }, [activeTab]);
  
  // Load support settings
  const loadSupportSettings = async () => {
    try {
      const settings = await getSupportSettings();
      setSupportChatEnabled(settings.enabled);
    } catch (error) {
      console.error("Error loading support settings:", error);
    }
  };
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingImports, setIsLoadingImports] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isDeletingImport, setIsDeletingImport] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRole = await getUserRole(user.uid);
          setIsAdmin(userRole?.role === 'admin');
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    checkAdminStatus();
  }, []);

  // Load users when admin tab is active
  useEffect(() => {
    if (activeTab === "users" && isAdmin) {
      loadUsers();
    }
  }, [activeTab, isAdmin]);

  // Load imports when imports tab is active
  useEffect(() => {
    if (activeTab === "imports") {
      loadImports();
    }
  }, [activeTab]);

  // Load users
  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const usersList = await getUsers();
      setUsers(usersList);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load imports
  const loadImports = async () => {
    try {
      setIsLoadingImports(true);
      const importsList = await listUserImports();
      setImports(importsList);
    } catch (error) {
      console.error("Error loading imports:", error);
    } finally {
      setIsLoadingImports(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file
    const validation = validateImportFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }
    
    const size = (file.size / 1024 / 1024).toFixed(2);
    setFileInfo({
      name: file.name,
      size: `${size} MB`
    });
    
    setError(null);
    setImportResult(null);
  };

  // State for import method
  const [importMethod, setImportMethod] = useState<'storage' | 'direct'>('direct');
  const [directImportProgress, setDirectImportProgress] = useState<DirectImportProgress | null>(null);

  const handleImport = async (event: React.FormEvent) => {
    event.preventDefault();
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    const file = fileInput.files?.[0];
    
    if (!file) {
      setError("Please select a file to import");
      return;
    }
    
    // Validate file again
    const validation = validateImportFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }
    
    // Check if user is authenticated
    if (!auth.currentUser) {
      setError("You must be logged in to import files. Please log in and try again.");
      return;
    }
    
    try {
      setIsImporting(true);
      setError(null);
      setImportResult(null);
      setUploadProgress(null);
      setDirectImportProgress(null);
      setImportId(undefined);
      
      if (importMethod === 'storage') {
        // Test Firebase Storage connection
        console.log("Testing Firebase Storage connection...");
        const isStorageConnected = await testFirebaseStorage();
        if (!isStorageConnected) {
          throw new Error("Firebase Storage is not properly configured. Please check your Firebase setup.");
        }
        console.log("Firebase Storage connection test passed");
        
        // Determine if we should use chunked upload based on file size
        const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10MB
        
        if (file.size > LARGE_FILE_THRESHOLD) {
          // Use chunked upload for large files
          const importId = await uploadLargeImportFile(file, (progress) => {
            setUploadProgress(progress);
            
            // When upload is complete, set the import ID for tracking
            if (progress.state === 'success' && progress.importId) {
              setImportId(progress.importId || undefined);
            }
          });
          
          // Set the import ID for tracking if not already set
          if (!importId) {
            setImportId(importId);
          }
        } else {
          // Use regular upload for smaller files
          await uploadImportFile(file, (progress) => {
            setUploadProgress(progress);
            
            // When upload is complete, set the import ID for tracking
            if (progress.state === 'success' && progress.importId) {
              setImportId(progress.importId || undefined);
            }
          });
        }
      } else {
        // Use direct import to Firestore
        console.log("Using direct import to Firestore...");
        
        try {
          const importId = await importFileDirectly(file, (progress) => {
            setDirectImportProgress(progress);
            
            // When import is complete
            if (progress.state === 'success' && progress.importId) {
              setImportId(progress.importId);
              handleImportComplete();
            }
          });
          
          // Set the import ID for tracking if not already set
          if (!importId) {
            setImportId(importId);
          }
        } catch (error) {
          console.error("Direct import error:", error);
          setError(`Failed to import file directly: ${(error as Error).message}`);
          setIsImporting(false);
        }
      }
    } catch (err) {
      console.error("Import error:", err);
      setError("Failed to upload file. Please try again.");
      setIsImporting(false);
    }
  };
  
  // Handle import completion
  const handleImportComplete = () => {
    setIsImporting(false);
    setImportResult("Import completed successfully.");
    // Refresh imports list if on imports tab
    if (activeTab === "imports") {
      loadImports();
    }
  };

  // Handle user role update
  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRole) return;
    
    try {
      setIsUpdatingRole(true);
      await updateUserRole(selectedUser.uid, selectedRole as 'admin' | 'user');
      // Refresh users list
      await loadUsers();
      setSelectedUser(null);
      setSelectedRole("");
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Handle import deletion
  const handleDeleteImport = async (importId: string) => {
    try {
      setIsDeletingImport(true);
      await deleteImport(importId);
      // Refresh imports list
      await loadImports();
    } catch (error) {
      console.error("Error deleting import:", error);
    } finally {
      setIsDeletingImport(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with breadcrumb */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Admin</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 bg-muted/30">
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <Card className="aspect-video bg-card rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Data Management</CardTitle>
              <CardDescription>
                Import and manage company data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload JSON or CSV files to import company data into the database.
                Each company should have a unique companyId.
              </p>
            </CardContent>
          </Card>
          
          <Card className="aspect-video bg-card rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">System Status</CardTitle>
              <CardDescription>
                Current system information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Database:</span>
                  <span className="text-sm font-medium text-green-500">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Auth Service:</span>
                  <span className="text-sm font-medium text-green-500">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Storage:</span>
                  <span className="text-sm font-medium text-green-500">Available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User Role:</span>
                  <span className="text-sm font-medium">
                    {isAdmin ? (
                      <Badge variant="default" className="bg-blue-500">Admin</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Import Data</span>
            </TabsTrigger>
            <TabsTrigger value="imports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Import History</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>User Management</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="support" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Support Chat</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Import Data Tab */}
          <TabsContent value="import">
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle>Import Company Data</CardTitle>
                <CardDescription>
                  Upload JSON or CSV files containing company data to import into the database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleImport} className="space-y-4">
                  {/* Import Method Selection */}
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="direct-import"
                        name="import-method"
                        value="direct"
                        checked={importMethod === 'direct'}
                        onChange={() => setImportMethod('direct')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="direct-import" className="text-sm font-medium">
                        Direct Import (Recommended)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="storage-import"
                        name="import-method"
                        value="storage"
                        checked={importMethod === 'storage'}
                        onChange={() => setImportMethod('storage')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="storage-import" className="text-sm font-medium">
                        Storage Import
                      </label>
                    </div>
                  </div>
                  
                  <div className="border-2 border-dashed rounded-lg p-6 text-center bg-background">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-sm mb-2">
                      <label htmlFor="file-upload" className="font-medium text-primary cursor-pointer hover:underline">
                        Click to upload
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".json,.csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JSON or CSV files, max 150MB
                    </p>
                    
                    {fileInfo && (
                      <div className="mt-4 p-2 bg-muted rounded flex items-center justify-between">
                        <div className="text-sm">
                          <p className="font-medium">{fileInfo.name}</p>
                          <p className="text-xs text-muted-foreground">{fileInfo.size}</p>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                            fileInput.value = '';
                            setFileInfo(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Progress (Storage Method) */}
                  {importMethod === 'storage' && uploadProgress && uploadProgress.state !== 'success' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading file...</span>
                        <span>{Math.round(uploadProgress.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${uploadProgress.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Direct Import Progress */}
                  {importMethod === 'direct' && directImportProgress && directImportProgress.state !== 'success' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Importing data directly...</span>
                          <span>{Math.round(directImportProgress.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${directImportProgress.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Import Stats */}
                      <div className="bg-gray-50 p-3 rounded-md text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>Total Records:</div>
                          <div className="text-right font-medium">{directImportProgress.totalRecords}</div>
                          
                          <div>Processed:</div>
                          <div className="text-right font-medium">{directImportProgress.processedRecords}</div>
                          
                          <div>Successful:</div>
                          <div className="text-right font-medium text-green-600">{directImportProgress.successfulRecords}</div>
                          
                          <div>Failed:</div>
                          <div className="text-right font-medium text-red-600">{directImportProgress.failedRecords}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Import Progress */}
                  {importId && (
                    <ImportProgress 
                      importId={importId} 
                      onComplete={handleImportComplete} 
                    />
                  )}
                  
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  
                  {importResult && (
                    <div className="p-3 bg-green-50 text-green-600 rounded-md text-sm">
                      {importResult}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isImporting || !fileInfo}
                  >
                    {isImporting ? "Importing..." : "Import Data"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Make sure your data follows the expected format. Each company should have a unique companyId.
                CSV files should have headers matching the required fields.
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Import History Tab */}
          <TabsContent value="imports">
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Import History</CardTitle>
                  <CardDescription>
                    View and manage your previous data imports
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadImports}
                  disabled={isLoadingImports}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingImports ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingImports ? (
                  <div className="flex justify-center items-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : imports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No import history found</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File Name</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {imports.map((importItem) => (
                          <TableRow key={importItem.importId}>
                            <TableCell className="font-medium">{importItem.fileName}</TableCell>
                            <TableCell>{formatDate(importItem.timestamp)}</TableCell>
                            <TableCell>
                              {importItem.status === 'uploaded' && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                  Processing
                                </Badge>
                              )}
                              {importItem.status === 'completed' && (
                                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                  Completed
                                </Badge>
                              )}
                              {importItem.status === 'failed' && (
                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                                  Failed
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteImport(importItem.importId)}
                                disabled={isDeletingImport}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* User Management Tab (Admin only) */}
          {isAdmin && (
            <TabsContent value="users">
              <Card className="rounded-xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage user roles and permissions
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadUsers}
                    disabled={isLoadingUsers}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="flex justify-center items-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No users found</p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.uid}>
                              <TableCell className="font-medium">{user.displayName || 'N/A'}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                {user.role === 'admin' ? (
                                  <Badge variant="default" className="bg-blue-500">Admin</Badge>
                                ) : (
                                  <Badge variant="outline">User</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setSelectedRole(user.role);
                                      }}
                                    >
                                      <Shield className="h-4 w-4 text-blue-500" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Update User Role</DialogTitle>
                                      <DialogDescription>
                                        Change the role for {selectedUser?.displayName || selectedUser?.email}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="role">Role</Label>
                                          <Select
                                            value={selectedRole}
                                            onValueChange={setSelectedRole}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="user">User</SelectItem>
                                              <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedUser(null);
                                          setSelectedRole("");
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={handleUpdateRole}
                                        disabled={isUpdatingRole || !selectedRole}
                                      >
                                        {isUpdatingRole ? "Updating..." : "Update Role"}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {/* Support Chat Settings Tab */}
          <TabsContent value="support">
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle>Support Chat Settings</CardTitle>
                <CardDescription>
                  Configure the support chat widget for your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Enable Live Support Chat</h3>
                      <p className="text-sm text-muted-foreground">
                        When enabled, users can chat with you in real-time. When disabled, they will see a contact form.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="support-chat-toggle" className="sr-only">
                        Toggle support chat
                      </Label>
                      <Switch
                        id="support-chat-toggle"
                        checked={supportChatEnabled}
                        onCheckedChange={setSupportChatEnabled}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Preview</h3>
                    <div className="border rounded-lg p-4 bg-muted/30 relative h-64 overflow-hidden">
                      <div className="absolute bottom-4 right-4">
                        <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white shadow-lg">
                          <MessageSquare className="h-5 w-5" />
                          <div className="absolute inset-0 rounded-full rgb-border"></div>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-20 right-4 w-72 bg-white rounded-lg shadow-lg p-3">
                        <div className="bg-gray-900 text-white p-2 rounded-t-lg flex justify-between items-center">
                          <span className="text-sm font-medium">Support Chat</span>
                          <X className="h-4 w-4" />
                        </div>
                        <div className="p-2 text-xs text-center text-muted-foreground">
                          {supportChatEnabled ? (
                            "Live chat preview - users will be able to chat with you in real-time"
                          ) : (
                            "Contact form preview - users will submit a form when you're offline"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button 
                  disabled={isSavingSupportSettings}
                  onClick={async () => {
                    try {
                      setIsSavingSupportSettings(true);
                      await updateSupportSettings({ enabled: supportChatEnabled });
                    } catch (error) {
                      console.error("Error saving support settings:", error);
                    } finally {
                      setIsSavingSupportSettings(false);
                    }
                  }}
                >
                  {isSavingSupportSettings ? "Saving..." : "Save Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
