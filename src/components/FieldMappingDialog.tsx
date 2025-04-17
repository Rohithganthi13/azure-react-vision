
import React, { useState, useEffect } from "react";
import { useAzureDevOps } from "@/contexts/AzureDevOpsContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Info, ArrowRight } from "lucide-react";

interface FieldMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MappingField {
  id: string;
  name: string;
  description: string;
}

interface Mapping {
  id: string;
  name: string;
  fields: Record<string, string>;
}

const taskFields: MappingField[] = [
  { id: "title", name: "Title", description: "Maps to the title/headline of the task" },
  { id: "description", name: "Description", description: "Maps to the main description content of the task" },
  { id: "acceptanceCriteria", name: "Acceptance Criteria", description: "Maps to the criteria that must be met for the task to be considered complete" },
  { id: "additionalInfo", name: "Additional Information", description: "Maps to any additional information or context about the task" },
];

const FieldMappingDialog: React.FC<FieldMappingDialogProps> = ({ open, onOpenChange }) => {
  const { azureFields, fetchAzureFields } = useAzureDevOps();
  const [activeTab, setActiveTab] = useState("import");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [mappings, setMappings] = useState<Record<string, string>>({
    title: "",
    description: "",
    acceptanceCriteria: "",
    additionalInfo: ""
  });
  const [presets, setPresets] = useState<Mapping[]>([
    { id: "default", name: "Default Mapping", fields: {
        title: "System.Title",
        description: "System.Description",
        acceptanceCriteria: "Microsoft.VSTS.Common.AcceptanceCriteria",
        additionalInfo: "System.AdditionalInfo"
      }
    }
  ]);
  
  useEffect(() => {
    if (open && !azureFields.length) {
      // This assumes there's a method to fetch available fields in the context
      // You may need to add this to the AzureDevOpsContext
      fetchAzureFields && fetchAzureFields();
    }
  }, [open, azureFields, fetchAzureFields]);

  const handleMappingChange = (taskField: string, azureField: string) => {
    setMappings(prev => ({
      ...prev,
      [taskField]: azureField
    }));
  };

  const handleSaveMapping = () => {
    // Save the current mapping
    // This would typically involve sending to a backend or storing in local storage
    console.log("Saving mapping:", mappings);
    onOpenChange(false);
  };

  const handleLoadPreset = () => {
    const preset = presets.find(p => p.id === selectedPreset);
    if (preset) {
      setMappings(preset.fields);
    }
  };

  const handleSaveAsPreset = () => {
    // Generate a unique ID
    const newId = `preset-${Date.now()}`;
    
    // Prompt for a name
    const name = prompt("Enter a name for this mapping preset:");
    
    if (name) {
      const newPreset: Mapping = {
        id: newId,
        name,
        fields: {...mappings}
      };
      
      setPresets([...presets, newPreset]);
      setSelectedPreset(newId);
    }
  };

  const handleDeletePreset = () => {
    if (selectedPreset) {
      setPresets(presets.filter(p => p.id !== selectedPreset));
      setSelectedPreset("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Azure DevOps Field Mapping</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import Mapping</TabsTrigger>
            <TabsTrigger value="export">Export Mapping</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-6">
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Mapping Presets</h3>
              
              <div className="flex flex-wrap items-center gap-2">
                <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a saved mapping" />
                  </SelectTrigger>
                  <SelectContent>
                    {presets.map(preset => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleLoadPreset}>Load</Button>
                <Button variant="outline" onClick={handleSaveAsPreset}>Save As...</Button>
                <Button 
                  variant="outline" 
                  onClick={handleDeletePreset}
                  disabled={!selectedPreset}
                >
                  Delete
                </Button>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Field Mapping</h3>
              <p className="text-sm text-muted-foreground">
                Map Azure DevOps fields to our required task fields for importing.
              </p>
              
              <div className="space-y-6">
                {taskFields.map(field => (
                  <div key={field.id} className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.name}</span>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      
                      <Select 
                        value={mappings[field.id]} 
                        onValueChange={(value) => handleMappingChange(field.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={`Select Azure DevOps field for ${field.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {/* This should be dynamically populated from Azure DevOps API */}
                          <SelectItem value="System.Title">Title</SelectItem>
                          <SelectItem value="System.Description">Description</SelectItem>
                          <SelectItem value="Microsoft.VSTS.Common.AcceptanceCriteria">Acceptance Criteria</SelectItem>
                          <SelectItem value="System.AdditionalInfo">Additional Info</SelectItem>
                          <SelectItem value="System.Tags">Tags</SelectItem>
                          <SelectItem value="System.Priority">Priority</SelectItem>
                          <SelectItem value="System.AssignedTo">Assigned To</SelectItem>
                          {/* Add more fields as needed */}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Export Mapping Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Configure how your task fields map to Azure DevOps fields when exporting.
            </p>
            
            {/* Similar to import but reversed mapping direction */}
            <div className="space-y-6">
              {taskFields.map(field => (
                <div key={field.id} className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{field.name}</span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    
                    <Select 
                      value={mappings[field.id]} 
                      onValueChange={(value) => handleMappingChange(field.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Select Azure DevOps field for ${field.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="System.Title">Title</SelectItem>
                        <SelectItem value="System.Description">Description</SelectItem>
                        <SelectItem value="Microsoft.VSTS.Common.AcceptanceCriteria">Acceptance Criteria</SelectItem>
                        <SelectItem value="System.AdditionalInfo">Additional Info</SelectItem>
                        <SelectItem value="System.Tags">Tags</SelectItem>
                        <SelectItem value="System.Priority">Priority</SelectItem>
                        <SelectItem value="System.AssignedTo">Assigned To</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveMapping}>
            Save Mapping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FieldMappingDialog;
