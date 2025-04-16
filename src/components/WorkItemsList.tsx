import { useState, useEffect } from "react";
import { useAzureDevOps } from "@/contexts/AzureDevOpsContext";
import { WorkItem } from "@/services/azureDevOpsService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Edit } from "lucide-react";
import EditWorkItemDialog from "./EditWorkItemDialog";

const WorkItemsList = () => {
  const { workItems, isLoading, refreshWorkItems, selectedProject } = useAzureDevOps();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let query = "";
    
    if (searchTerm) {
      query = `Select [System.Id] From WorkItems Where [System.TeamProject] = @project AND [System.Title] CONTAINS '${searchTerm}' Order By [System.ChangedDate] Desc`;
    }
    
    refreshWorkItems(query);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    let query = "";
    if (value !== "all") {
      query = `Select [System.Id] From WorkItems Where [System.TeamProject] = @project AND [System.State] = '${value}' Order By [System.ChangedDate] Desc`;
    }
    
    refreshWorkItems(query);
  };

  useEffect(() => {
    if (selectedProject) {
      refreshWorkItems();
    }
  }, [selectedProject]);

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please select a project</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Work Items - {selectedProject.name}</CardTitle>
        <CardDescription>
          View and search work items from your Azure DevOps project
        </CardDescription>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <form onSubmit={handleSearch} className="flex space-x-2 flex-1">
            <Input
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => refreshWorkItems()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="New">New</TabsTrigger>
            <TabsTrigger value="Active">Active</TabsTrigger>
            <TabsTrigger value="Resolved">Resolved</TabsTrigger>
            <TabsTrigger value="Closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center p-8">
            <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4" />
            <p>Loading work items...</p>
          </div>
        ) : workItems.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No work items found
          </div>
        ) : (
          <div className="space-y-4">
            {workItems.map((item) => (
              <WorkItemCard key={item.id} workItem={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface WorkItemCardProps {
  workItem: WorkItem;
}

const WorkItemCard = ({ workItem }: WorkItemCardProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { refreshWorkItems } = useAzureDevOps();
  const { fields } = workItem;
  
  const getStateBadgeColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "new":
        return "bg-blue-500";
      case "active":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className={getStateBadgeColor(fields["System.State"])}>
                {fields["System.State"]}
              </Badge>
              <span className="text-xs text-muted-foreground">#{workItem.id}</span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <h4 className="font-medium text-lg">{fields["System.Title"]}</h4>
            <p className="text-sm text-muted-foreground">
              {fields["System.WorkItemType"]} • Created {formatDate(fields["System.CreatedDate"])}
            </p>
          </div>
          
          {fields["System.AssignedTo"] && (
            <Avatar>
              <AvatarFallback>
                {getInitials(fields["System.AssignedTo"].displayName)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
      
      <EditWorkItemDialog
        workItem={workItem}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdate={refreshWorkItems}
      />
    </Card>
  );
};

export default WorkItemsList;
