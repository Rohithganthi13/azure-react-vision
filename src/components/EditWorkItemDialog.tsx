
import { useState } from "react";
import { WorkItem, WorkItemUpdate, azureDevOpsService } from "@/services/azureDevOpsService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAzureDevOps } from "@/contexts/AzureDevOpsContext";
import { Loader2 } from "lucide-react";

interface EditWorkItemDialogProps {
  workItem: WorkItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const EditWorkItemDialog = ({ workItem, open, onOpenChange, onUpdate }: EditWorkItemDialogProps) => {
  const { toast } = useToast();
  const { selectedProject } = useAzureDevOps();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<WorkItemUpdate>({
    title: workItem.fields["System.Title"],
    description: workItem.fields["System.Description"] || "",
    state: workItem.fields["System.State"],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    setIsLoading(true);
    try {
      await azureDevOpsService.updateWorkItem(selectedProject.name, workItem.id, formData);
      toast({
        title: "Success",
        description: "Work item updated successfully",
      });
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update work item:", error);
      toast({
        title: "Error",
        description: "Failed to update work item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Work Item #{workItem.id}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="state" className="text-sm font-medium">State</label>
            <Select
              value={formData.state}
              onValueChange={(value) => setFormData({ ...formData, state: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWorkItemDialog;
