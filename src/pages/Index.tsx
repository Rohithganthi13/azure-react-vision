
import { useAzureDevOps } from "@/contexts/AzureDevOpsContext";
import LoginForm from "@/components/LoginForm";
import Header from "@/components/Header";
import WorkItemsList from "@/components/WorkItemsList";
import Dashboard from "@/components/Dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Import, FileExport } from "lucide-react";
import { useState } from "react";
import FieldMappingDialog from "@/components/FieldMappingDialog";

const Index = () => {
  const { isAuthenticated, isLoading } = useAzureDevOps();
  const [isMappingOpen, setIsMappingOpen] = useState(false);
  const [mappingMode, setMappingMode] = useState<"import" | "export">("import");

  const handleOpenImportMapping = () => {
    setMappingMode("import");
    setIsMappingOpen(true);
  };

  const handleOpenExportMapping = () => {
    setMappingMode("export");
    setIsMappingOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8 px-4">
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto mt-10">
            <h1 className="text-3xl font-bold text-center mb-8">
              Azure DevOps Explorer
            </h1>
            <LoginForm />
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4 gap-2">
              <Button variant="outline" onClick={handleOpenImportMapping}>
                <Import className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" onClick={handleOpenExportMapping}>
                <FileExport className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="workItems">Work Items</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <Dashboard />
              </TabsContent>

              <TabsContent value="workItems" className="space-y-6">
                <WorkItemsList />
              </TabsContent>
            </Tabs>
            
            {/* Field Mapping Dialog */}
            <FieldMappingDialog 
              open={isMappingOpen} 
              onOpenChange={setIsMappingOpen} 
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
