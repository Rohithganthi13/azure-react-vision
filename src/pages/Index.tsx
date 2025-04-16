import { useAzureDevOps } from "@/contexts/AzureDevOpsContext";
import LoginForm from "@/components/LoginForm";
import Header from "@/components/Header";
import WorkItemsList from "@/components/WorkItemsList";
import Dashboard from "@/components/Dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { isAuthenticated, isLoading } = useAzureDevOps();

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
        )}
      </main>
    </div>
  );
};

export default Index;
