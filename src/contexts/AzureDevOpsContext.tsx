import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  azureDevOpsService, 
  AzureDevOpsConfig, 
  Project, 
  WorkItem
} from "@/services/azureDevOpsService";

interface AzureDevOpsContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  projects: Project[];
  selectedProject: Project | null;
  workItems: WorkItem[];
  azureFields: any[];
  fetchAzureFields: () => Promise<void>;
  login: (config: AzureDevOpsConfig) => Promise<void>;
  logout: () => void;
  selectProject: (project: Project) => void;
  refreshWorkItems: (query?: string) => Promise<void>;
}

const AzureDevOpsContext = createContext<AzureDevOpsContextType | undefined>(undefined);

export const AzureDevOpsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [azureFields, setAzureFields] = useState<any[]>([]);

  useEffect(() => {
    const config = azureDevOpsService.getConfig();
    if (config) {
      loadProjects();
    }
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const projectsData = await azureDevOpsService.getProjects();
      setProjects(projectsData);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError("Failed to authenticate with Azure DevOps. Please check your credentials.");
      azureDevOpsService.clearConfig();
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (config: AzureDevOpsConfig) => {
    setIsLoading(true);
    setError(null);
    
    try {
      azureDevOpsService.setConfig(config);
      await loadProjects();
    } catch (err) {
      console.error("Login failed:", err);
      setError("Failed to authenticate with Azure DevOps. Please check your credentials.");
      azureDevOpsService.clearConfig();
      setIsAuthenticated(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    azureDevOpsService.clearConfig();
    setIsAuthenticated(false);
    setProjects([]);
    setSelectedProject(null);
    setWorkItems([]);
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    refreshWorkItems();
  };

  const refreshWorkItems = async (query?: string) => {
    if (!selectedProject) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const items = await azureDevOpsService.getWorkItems(selectedProject.name, query);
      setWorkItems(items);
    } catch (err) {
      console.error("Failed to load work items:", err);
      setError("Failed to load work items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAzureFields = async () => {
    try {
      if (!selectedProject) return;
      
      const fields = await azureDevOpsService.getWorkItemFields(selectedProject.name);
      setAzureFields(fields);
    } catch (error) {
      console.error("Error fetching Azure DevOps fields:", error);
      toast({
        title: "Error",
        description: "Failed to fetch field definitions",
        variant: "destructive",
      });
    }
  };

  return (
    <AzureDevOpsContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        error,
        projects,
        selectedProject,
        workItems,
        azureFields,
        fetchAzureFields,
        login,
        logout,
        selectProject,
        refreshWorkItems
      }}
    >
      {children}
    </AzureDevOpsContext.Provider>
  );
};

export const useAzureDevOps = () => {
  const context = useContext(AzureDevOpsContext);
  if (context === undefined) {
    throw new Error("useAzureDevOps must be used within an AzureDevOpsProvider");
  }
  return context;
};
