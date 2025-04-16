import { useAzureDevOps } from "@/contexts/AzureDevOpsContext";
import { Button } from "@/components/ui/button";
import ProjectSelector from "@/components/ProjectSelector";
import { LogOut } from "lucide-react";

const Header = () => {
  const { isAuthenticated, logout } = useAzureDevOps();

  if (!isAuthenticated) return null;

  return (
    <header className="border-b p-4 bg-background flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <img
          src="https://cdn.worldvectorlogo.com/logos/azure-devops.svg"
          alt="Azure DevOps"
          className="w-8 h-8"
        />
        <h1 className="font-bold text-xl">Azure DevOps Integration</h1>
      </div>

      <div className="flex items-center gap-4">
        <ProjectSelector />
        <Button variant="outline" size="icon" onClick={logout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
