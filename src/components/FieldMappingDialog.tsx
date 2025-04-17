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
import { Info, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FieldDefinition } from "@/services/azureDevOpsService";

interface FieldMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MappingField {
  id: string;
  name: string;
  description: string;
}

interface FieldMapping {
  referenceName: string;
  displayName: string;
}

interface Mapping {
  id: string;
  name: string;
  fields: Record<string, FieldMapping>;
}

const taskFields: MappingField[] = [
  { id: "title", name: "Title", description: "Maps to the title/headline of the task" },
  { id: "description", name: "Description", description: "Maps to the main description content of the task" },
  { id: "acceptanceCriteria", name: "Acceptance Criteria", description: "Maps to the criteria that must be met for the task to be considered complete" },
  { id: "additionalInfo", name: "Additional Information", description: "Maps to any additional information or context about the task" },
];

// Fields that are actually shown in the WorkItemDetails component
const relevantFieldTypes = [
  "System.Id",
  "System.Title",
  "System.Description",
  "System.State",
  "System.AssignedTo",
  "System.CreatedBy",
  "System.WorkItemType",
  "System.Tags",
  "System.CreatedDate",
  "Microsoft.VSTS.Common.Priority",
  "Microsoft.VSTS.Common.AcceptanceCriteria"
];

const FieldMappingDialog: React.FC<FieldMappingDialogProps> = ({ open, onOpenChange }) => {
  const { azureFields, fetchAzureFields, selectedProject } = useAzureDevOps();
  const [activeTab, setActiveTab] = useState("import");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [mappings, setMappings] = useState<Record<string, FieldMapping>>({
    title: { referenceName: "", displayName: "" },
    description: { referenceName: "", displayName: "" },
    acceptanceCriteria: { referenceName: "", displayName: "" },
    additionalInfo: { referenceName: "", displayName: "" }
  });
  const [presets, setPresets] = useState<Mapping[]>([
    { id: "default", name: "Default Mapping", fields: {
        title: { referenceName: "System.Title", displayName: "Title" },
        description: { referenceName: "System.Description", displayName: "Description" },
        acceptanceCriteria: { referenceName: "Microsoft.VSTS.Common.AcceptanceCriteria", displayName: "Acceptance Criteria" },
        additionalInfo: { referenceName: "System.AdditionalInfo", displayName: "Additional Info" }
      }
    }
  ]);
  const { toast } = useToast();
  
  // Load fields when dialog opens
  useEffect(() => {
    if (open && selectedProject && (!azureFields || azureFields.length === 0)) {
      fetchAzureFields();
    }
  }, [open, azureFields, fetchAzureFields, selectedProject]);

  // Load saved presets from localStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem('fieldMappingPresets');
    if (savedPresets) {
      try {
        const parsedPresets = JSON.parse(savedPresets);
        if (Array.isArray(parsedPresets) && parsedPresets.length > 0) {
          setPresets(prev => {
            // Filter out duplicates by ID
            const existingIds = prev.map(p => p.id);
            const newPresets = parsedPresets.filter(p => !existingIds.includes(p.id));
            return [...prev, ...newPresets];
          });
        }
      } catch (e) {
        console.error('Failed to parse saved presets:', e);
      }
    }
  }, []);

  const handleMappingChange = (taskField: string, azureFieldRef: string) => {
    // Find the display name for the selected reference name
    const selectedField = azureFields?.find(field => field.referenceName === azureFieldRef);
    const displayName = selectedField ? selectedField.name : azureFieldRef;
    
    setMappings(prev => ({
      ...prev,
      [taskField]: {
        referenceName: azureFieldRef,
        displayName: displayName
      }
    }));
  };

  const handleSaveMapping = () => {
    // Create a more user-friendly version of the mapping for logging
    // This now uses display names instead of reference names
    const displayMapping = Object.entries(mappings).reduce((acc, [key, mapping]) => {
      acc[key] = mapping.displayName || mapping.referenceName || "";
      return acc;
    }, {} as Record<string, string>);
    
    // Log the display mapping and full mapping
    console.log("Saving mapping (display names):", JSON.stringify(displayMapping, null, 2));
    console.log("Full mapping data:", JSON.stringify(mappings, null, 2));
    
    // Save the current preset to localStorage if one is selected
    if (selectedPreset) {
      const updatedPresets = presets.map(preset => 
        preset.id === selectedPreset ? { ...preset, fields: { ...mappings } } : preset
      );
      setPresets(updatedPresets);
      localStorage.setItem('fieldMappingPresets', JSON.stringify(updatedPresets));
    }
    
    toast({
      title: "Mapping Saved",
      description: "Your field mapping has been saved successfully.",
    });
    
    onOpenChange(false);
  };

  const handleLoadPreset = () => {
    const preset = presets.find(p => p.id === selectedPreset);
    if (preset) {
      setMappings(preset.fields);
      toast({
        title: "Preset Loaded",
        description: `Loaded mapping preset: ${preset.name}`,
      });
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
      
      const updatedPresets = [...presets, newPreset];
      setPresets(updatedPresets);
      setSelectedPreset(newId);
      
      // Save to localStorage
      localStorage.setItem('fieldMappingPresets', JSON.stringify(updatedPresets));
      
      toast({
        title: "Preset Saved",
        description: `Saved new mapping preset: ${name}`,
      });
    }
  };

  const handleDeletePreset = () => {
    if (selectedPreset) {
      const presetName = presets.find(p => p.id === selectedPreset)?.name;
      const updatedPresets = presets.filter(p => p.id !== selectedPreset);
      setPresets(updatedPresets);
      setSelectedPreset("");
      
      // Save to localStorage
      localStorage.setItem('fieldMappingPresets', JSON.stringify(updatedPresets));
      
      toast({
        title: "Preset Deleted",
        description: `Deleted mapping preset: ${presetName}`,
      });
    }
  };
  
  // Filter the Azure fields to only show those that are used in the WorkItemDetails component
  const filteredAzureFields = Array.isArray(azureFields) 
    ? azureFields.filter(field => 
        relevantFieldTypes.includes(field.referenceName) ||
        field.name.toLowerCase().includes('title') ||
        field.name.toLowerCase().includes('description') ||
        field.name.toLowerCase().includes('created') ||
        field.name.toLowerCase().includes('assigned')
      )
    : [];

  // Check if we have fields to populate in the dropdown
  const hasAzureFields = filteredAzureFields.length > 0;

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
                        value={mappings[field.id]?.referenceName || ""} 
                        onValueChange={(value) => handleMappingChange(field.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={`Select Azure DevOps field for ${field.name}`} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {hasAzureFields ? (
                            filteredAzureFields.map((azureField: FieldDefinition) => (
                              <SelectItem key={azureField.referenceName} value={azureField.referenceName}>
                                {azureField.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading" disabled>
                              Loading fields...
                            </SelectItem>
                          )}
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
                      value={mappings[field.id]?.referenceName || ""} 
                      onValueChange={(value) => handleMappingChange(field.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Select Azure DevOps field for ${field.name}`} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {hasAzureFields ? (
                          filteredAzureFields.map((azureField: FieldDefinition) => (
                            <SelectItem key={azureField.referenceName} value={azureField.referenceName}>
                              {azureField.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            Loading fields...
                          </SelectItem>
                        )}
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
