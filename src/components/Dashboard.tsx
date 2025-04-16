
import { useEffect } from "react";
import { useAzureDevOps } from "@/contexts/AzureDevOpsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const { selectedProject, workItems, refreshWorkItems } = useAzureDevOps();
  
  useEffect(() => {
    if (selectedProject) {
      refreshWorkItems();
    }
  }, [selectedProject]);
  
  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please select a project to see dashboard</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dashboard - {selectedProject.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Work Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workItems.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Work Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workItems.filter(item => item.fields["System.State"] === "Active").length}
              </div>
              <Progress 
                value={
                  (workItems.filter(item => item.fields["System.State"] === "Active").length / 
                  workItems.length) * 100
                } 
                className="mt-2"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed Work Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workItems.filter(item => 
                  item.fields["System.State"] === "Closed" || 
                  item.fields["System.State"] === "Resolved"
                ).length}
              </div>
              <Progress 
                value={
                  (workItems.filter(item => 
                    item.fields["System.State"] === "Closed" || 
                    item.fields["System.State"] === "Resolved"
                  ).length / 
                  workItems.length) * 100
                } 
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
