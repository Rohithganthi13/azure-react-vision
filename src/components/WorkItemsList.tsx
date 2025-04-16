
import { useState } from "react";
import { useAzureDevOps } from "@/contexts/AzureDevOpsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { WorkItem } from "@/services/azureDevOpsService";
import { formatDate } from "@/utils/dateUtils";
import WorkItemDetails from "./WorkItemDetails";

const WorkItemsList = () => {
  const { workItems, isLoading, refreshWorkItems, selectedProject } = useAzureDevOps();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let query = "";
    
    if (searchTerm) {
      query = `Select [System.Id] From WorkItems Where [System.TeamProject] = @project AND [System.Title] CONTAINS '${searchTerm}' Order By [System.ChangedDate] Desc`;
    }
    
    refreshWorkItems(query);
  };

  const handleTabChange = (value: string) => {
    let query = "";
    if (value !== "all") {
      query = `Select [System.Id] From WorkItems Where [System.TeamProject] = @project AND [System.State] = '${value}' Order By [System.ChangedDate] Desc`;
    }
    refreshWorkItems(query);
  };

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please select a project</p>
        </CardContent>
      </Card>
    );
  }

  const renderWorkItemsList = (items: WorkItem[]) => {
    if (isLoading) {
      return (
        <div className="text-center p-8">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>Loading work items...</p>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-center p-8 text-muted-foreground">
          No work items found
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((item) => (
          <Card 
            key={item.id} 
            className="hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">#{item.id}</span>
                    <Badge>{item.fields["System.State"]}</Badge>
                    <Badge variant="outline">{item.fields["System.WorkItemType"]}</Badge>
                  </div>
                  {item.fields["Microsoft.VSTS.Common.Priority"] && (
                    <Badge variant="secondary">P{item.fields["Microsoft.VSTS.Common.Priority"]}</Badge>
                  )}
                </div>
                <h4 className="font-medium">{item.fields["System.Title"]}</h4>
                <div className="text-sm text-muted-foreground">
                  <span>Created {formatDate(item.fields["System.CreatedDate"])}</span>
                  {item.fields["System.AssignedTo"] && (
                    <span> • Assigned to {item.fields["System.AssignedTo"].displayName}</span>
                  )}
                </div>
                {item.fields["System.Tags"] && (
                  <div className="flex gap-2 flex-wrap">
                    {item.fields["System.Tags"].split(';').map((tag: string) => (
                      <Badge key={tag} variant="outline">{tag.trim()}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            {selectedItem?.id === item.id && (
              <WorkItemDetails workItem={item} onClose={() => setSelectedItem(null)} />
            )}
          </Card>
        ))}
      </div>
    );
  };

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
        
        <Tabs defaultValue="all" onValueChange={handleTabChange} className="mt-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="New">New</TabsTrigger>
            <TabsTrigger value="Active">Active</TabsTrigger>
            <TabsTrigger value="Resolved">Resolved</TabsTrigger>
            <TabsTrigger value="Closed">Closed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            {renderWorkItemsList(workItems)}
          </TabsContent>
          <TabsContent value="New" className="mt-4">
            {renderWorkItemsList(workItems)}
          </TabsContent>
          <TabsContent value="Active" className="mt-4">
            {renderWorkItemsList(workItems)}
          </TabsContent>
          <TabsContent value="Resolved" className="mt-4">
            {renderWorkItemsList(workItems)}
          </TabsContent>
          <TabsContent value="Closed" className="mt-4">
            {renderWorkItemsList(workItems)}
          </TabsContent>
        </Tabs>
      </CardHeader>
      <CardContent>
        {renderWorkItemsList(workItems)}
      </CardContent>
    </Card>
  );
};

export default WorkItemsList;
