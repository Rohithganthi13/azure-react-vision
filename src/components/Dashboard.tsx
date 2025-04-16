
import { useEffect } from "react";
import { useAzureDevOps } from "@/contexts/AzureDevOpsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Work Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workItems.length}</div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
