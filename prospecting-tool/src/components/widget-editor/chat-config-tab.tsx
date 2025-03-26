import { useState } from "react";
import { ChatWidget } from "./chat-widget-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { MessageSquare, Bot, Users, Settings } from "lucide-react";

interface ChatConfigTabProps {
  chatConfig: ChatWidget['chatConfig'];
  onChange: (chatConfig: ChatWidget['chatConfig']) => void;
}

export function ChatConfigTab({ chatConfig, onChange }: ChatConfigTabProps) {
  const [activeTab, setActiveTab] = useState("general");

  // Update a specific field in the chat config
  const updateField = (field: string, value: any) => {
    onChange({
      ...chatConfig,
      [field]: value
    });
  };

  // Update a nested field in the chat config
  const updateNestedField = (parent: keyof ChatWidget['chatConfig'], field: string, value: any) => {
    const parentObj = chatConfig[parent];
    if (typeof parentObj === 'object' && parentObj !== null) {
      onChange({
        ...chatConfig,
        [parent]: {
          ...parentObj,
          [field]: value
        }
      });
    }
  };

  // Toggle a boolean field
  const toggleField = (field: keyof ChatWidget['chatConfig']) => {
    const currentValue = chatConfig[field];
    if (typeof currentValue === 'boolean') {
      updateField(field, !currentValue);
    }
  };

  // Add a field to the required visitor fields array
  const addRequiredField = (field: string) => {
    if (!chatConfig.requiredVisitorFields.includes(field)) {
      updateField('requiredVisitorFields', [...chatConfig.requiredVisitorFields, field]);
    }
  };

  // Remove a field from the required visitor fields array
  const removeRequiredField = (field: string) => {
    updateField(
      'requiredVisitorFields', 
      chatConfig.requiredVisitorFields.filter(f => f !== field)
    );
  };

  // Add a file type to the allowed file types array
  const addFileType = (type: string) => {
    if (!chatConfig.allowedFileTypes.includes(type)) {
      updateField('allowedFileTypes', [...chatConfig.allowedFileTypes, type]);
    }
  };

  // Remove a file type from the allowed file types array
  const removeFileType = (type: string) => {
    updateField(
      'allowedFileTypes', 
      chatConfig.allowedFileTypes.filter(t => t !== type)
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span>AI Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Team</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Advanced</span>
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Chat Settings</CardTitle>
              <CardDescription>
                Configure the basic settings for your chat widget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  value={chatConfig.welcomeMessage}
                  onChange={(e) => updateField('welcomeMessage', e.target.value)}
                  placeholder="Enter the message visitors will see when they open the chat"
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="offlineMessage">Offline Message</Label>
                <Textarea
                  id="offlineMessage"
                  value={chatConfig.offlineMessage}
                  onChange={(e) => updateField('offlineMessage', e.target.value)}
                  placeholder="Enter the message visitors will see when your team is offline"
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inputPlaceholder">Input Placeholder</Label>
                <Input
                  id="inputPlaceholder"
                  value={chatConfig.inputPlaceholder}
                  onChange={(e) => updateField('inputPlaceholder', e.target.value)}
                  placeholder="Type your message..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* AI Assistant Settings */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Configure the AI assistant for your chat widget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="useAI">Enable AI Assistant</Label>
                  <p className="text-sm text-muted-foreground">
                    Let an AI handle initial conversations and common questions
                  </p>
                </div>
                <Switch
                  id="useAI"
                  checked={chatConfig.useAI}
                  onCheckedChange={(checked) => updateField('useAI', checked)}
                />
              </div>
              
              {chatConfig.useAI && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="aiWelcomeMessage">AI Welcome Message</Label>
                    <Textarea
                      id="aiWelcomeMessage"
                      value={chatConfig.aiWelcomeMessage}
                      onChange={(e) => updateField('aiWelcomeMessage', e.target.value)}
                      placeholder="Enter the message the AI will use to introduce itself"
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aiModel">AI Model</Label>
                    <Select
                      value={chatConfig.aiModel}
                      onValueChange={(value) => updateField('aiModel', value)}
                    >
                      <SelectTrigger id="aiModel">
                        <SelectValue placeholder="Select AI model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                        <SelectItem value="custom">Custom API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {chatConfig.aiModel === 'custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="aiApiKey">Custom API Key</Label>
                      <Input
                        id="aiApiKey"
                        value={chatConfig.aiApiKey || ''}
                        onChange={(e) => updateField('aiApiKey', e.target.value)}
                        type="password"
                        placeholder="Enter your API key"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your API key is stored securely and never shared
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Team Settings */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Settings</CardTitle>
              <CardDescription>
                Configure how your team appears in the chat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={chatConfig.teamName}
                  onChange={(e) => updateField('teamName', e.target.value)}
                  placeholder="Support Team"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="responseTime">Response Time Message</Label>
                <Input
                  id="responseTime"
                  value={chatConfig.responseTime}
                  onChange={(e) => updateField('responseTime', e.target.value)}
                  placeholder="Usually responds in a few minutes"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showAgentNames">Show Agent Names</Label>
                  <p className="text-sm text-muted-foreground">
                    Display the name of the agent in the chat
                  </p>
                </div>
                <Switch
                  id="showAgentNames"
                  checked={chatConfig.showAgentNames}
                  onCheckedChange={(checked) => updateField('showAgentNames', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showAgentAvatars">Show Agent Avatars</Label>
                  <p className="text-sm text-muted-foreground">
                    Display the avatar of the agent in the chat
                  </p>
                </div>
                <Switch
                  id="showAgentAvatars"
                  checked={chatConfig.showAgentAvatars}
                  onCheckedChange={(checked) => updateField('showAgentAvatars', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced Settings */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced settings for your chat widget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="collectVisitorInfo">Collect Visitor Information</Label>
                  <p className="text-sm text-muted-foreground">
                    Ask visitors for their information before starting a chat
                  </p>
                </div>
                <Switch
                  id="collectVisitorInfo"
                  checked={chatConfig.collectVisitorInfo}
                  onCheckedChange={(checked) => updateField('collectVisitorInfo', checked)}
                />
              </div>
              
              {chatConfig.collectVisitorInfo && (
                <div className="space-y-2">
                  <Label>Required Visitor Fields</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="field-name"
                        checked={chatConfig.requiredVisitorFields.includes('name')}
                        onChange={(e) => e.target.checked ? addRequiredField('name') : removeRequiredField('name')}
                      />
                      <label htmlFor="field-name">Name</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="field-email"
                        checked={chatConfig.requiredVisitorFields.includes('email')}
                        onChange={(e) => e.target.checked ? addRequiredField('email') : removeRequiredField('email')}
                      />
                      <label htmlFor="field-email">Email</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="field-phone"
                        checked={chatConfig.requiredVisitorFields.includes('phone')}
                        onChange={(e) => e.target.checked ? addRequiredField('phone') : removeRequiredField('phone')}
                      />
                      <label htmlFor="field-phone">Phone</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="field-company"
                        checked={chatConfig.requiredVisitorFields.includes('company')}
                        onChange={(e) => e.target.checked ? addRequiredField('company') : removeRequiredField('company')}
                      />
                      <label htmlFor="field-company">Company</label>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="fileAttachmentsEnabled">Enable File Attachments</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow visitors to upload files in the chat
                  </p>
                </div>
                <Switch
                  id="fileAttachmentsEnabled"
                  checked={chatConfig.fileAttachmentsEnabled}
                  onCheckedChange={(checked) => updateField('fileAttachmentsEnabled', checked)}
                />
              </div>
              
              {chatConfig.fileAttachmentsEnabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      min="1"
                      max="20"
                      value={chatConfig.maxFileSize}
                      onChange={(e) => updateField('maxFileSize', parseInt(e.target.value) || 5)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Allowed File Types</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="type-images"
                          checked={chatConfig.allowedFileTypes.includes('image/*')}
                          onChange={(e) => e.target.checked ? addFileType('image/*') : removeFileType('image/*')}
                        />
                        <label htmlFor="type-images">Images</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="type-pdf"
                          checked={chatConfig.allowedFileTypes.includes('application/pdf')}
                          onChange={(e) => e.target.checked ? addFileType('application/pdf') : removeFileType('application/pdf')}
                        />
                        <label htmlFor="type-pdf">PDF Documents</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="type-word"
                          checked={chatConfig.allowedFileTypes.includes('.doc') || chatConfig.allowedFileTypes.includes('.docx')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              addFileType('.doc');
                              addFileType('.docx');
                            } else {
                              removeFileType('.doc');
                              removeFileType('.docx');
                            }
                          }}
                        />
                        <label htmlFor="type-word">Word Documents</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="type-excel"
                          checked={chatConfig.allowedFileTypes.includes('.xls') || chatConfig.allowedFileTypes.includes('.xlsx')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              addFileType('.xls');
                              addFileType('.xlsx');
                            } else {
                              removeFileType('.xls');
                              removeFileType('.xlsx');
                            }
                          }}
                        />
                        <label htmlFor="type-excel">Excel Spreadsheets</label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
