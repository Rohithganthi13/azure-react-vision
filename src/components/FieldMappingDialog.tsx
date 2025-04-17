
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
  const { azureFields, fetchAzureFields, selectedProject } = useAzureDevOps();
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
          setPresets([...presets, ...parsedPresets]);
        }
      } catch (e) {
        console.error('Failed to parse saved presets:', e);
      }
    }
  }, []);

  const handleMappingChange = (taskField: string, azureField: string) => {
    setMappings(prev => ({
      ...prev,
      [taskField]: azureField
    }));
  };

  const handleSaveMapping = () => {
    // Save the current mapping and log it
    const mappingJSON = JSON.stringify(mappings, null, 2);
    console.log("Saving mapping:", mappingJSON);
    
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
  
  // Check if we have fields to populate in the dropdown
  const hasAzureFields = Array.isArray(azureFields) && azureFields.length > 0;

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
                        <SelectContent className="max-h-[300px]">
                          {hasAzureFields ? (
                            azureFields.map((azureField: FieldDefinition) => (
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
                      value={mappings[field.id]} 
                      onValueChange={(value) => handleMappingChange(field.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Select Azure DevOps field for ${field.name}`} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {hasAzureFields ? (
                          azureFields.map((azureField: FieldDefinition) => (
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
