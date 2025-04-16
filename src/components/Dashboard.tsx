
import { useEffect, useState } from "react";
import { useAzureDevOps } from "@/contexts/AzureDevOpsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { azureDevOpsService, WorkItem } from "@/services/azureDevOpsService";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const Dashboard = () => {
  const { selectedProject, workItems, refreshWorkItems } = useAzureDevOps();
  const [workItemTypes, setWorkItemTypes] = useState<string[]>([]);
  const [stateStats, setStateStats] = useState<{ name: string; value: number }[]>([]);
  const [typeStats, setTypeStats] = useState<{ name: string; value: number }[]>([]);
  
  useEffect(() => {
    if (selectedProject) {
      refreshWorkItems();
      loadWorkItemTypes();
    }
  }, [selectedProject]);
  
  useEffect(() => {
    if (workItems.length > 0) {
      calculateStats();
    }
  }, [workItems]);
  
  const loadWorkItemTypes = async () => {
    if (!selectedProject) return;
    
    try {
      const types = await azureDevOpsService.getWorkItemTypes(selectedProject.name);
      setWorkItemTypes(types);
    } catch (error) {
      console.error("Failed to load work item types:", error);
    }
  };
  
  const calculateStats = () => {
    // Calculate state statistics
    const stateCount = workItems.reduce((acc: Record<string, number>, item: WorkItem) => {
      const state = item.fields["System.State"];
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});
    
    const stateData = Object.entries(stateCount).map(([name, value]) => ({
      name,
      value,
    }));
    
    setStateStats(stateData);
    
    // Calculate type statistics
    const typeCount = workItems.reduce((acc: Record<string, number>, item: WorkItem) => {
      const type = item.fields["System.WorkItemType"];
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    const typeData = Object.entries(typeCount).map(([name, value]) => ({
      name,
      value,
    }));
    
    setTypeStats(typeData);
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
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
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="state">By State</TabsTrigger>
            <TabsTrigger value="type">By Type</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="state">
            <div className="h-80">
              {stateStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stateStats}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stateStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="type">
            <div className="h-80">
              {typeStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={typeStats}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0078D4" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
