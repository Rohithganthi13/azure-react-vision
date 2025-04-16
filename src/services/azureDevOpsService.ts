
import axios from "axios";

// Azure DevOps API endpoints
const BASE_URL = "https://dev.azure.com/";

export interface AzureDevOpsConfig {
  organizationName: string;
  personalAccessToken: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  state: string;
  lastUpdateTime: string;
}

export interface WorkItem {
  id: number;
  rev: number;
  fields: {
    "System.Title": string;
    "System.State": string;
    "System.CreatedBy": {
      displayName: string;
    };
    "System.AssignedTo"?: {
      displayName: string;
    };
    "System.Description"?: string;
    "System.WorkItemType": string;
    "System.CreatedDate": string;
    "System.ChangedDate": string;
    [key: string]: any; // Allow any additional fields from Azure DevOps
  };
}

export interface TeamMember {
  id: string;
  displayName: string;
  uniqueName: string;
  imageUrl?: string;
}

export interface WorkItemUpdate {
  title?: string;
  description?: string;
  state?: string;
  assignedTo?: string;
}

class AzureDevOpsService {
  private config: AzureDevOpsConfig | null = null;

  setConfig(config: AzureDevOpsConfig) {
    this.config = config;
    localStorage.setItem("azureDevOpsConfig", JSON.stringify(config));
  }

  getConfig(): AzureDevOpsConfig | null {
    if (this.config) return this.config;
    
    const storedConfig = localStorage.getItem("azureDevOpsConfig");
    if (storedConfig) {
      this.config = JSON.parse(storedConfig);
      return this.config;
    }
    
    return null;
  }

  clearConfig() {
    this.config = null;
    localStorage.removeItem("azureDevOpsConfig");
  }

  private getAuthHeaders() {
    if (!this.config) throw new Error("Azure DevOps configuration not set");
    
    const token = btoa(`:${this.config.personalAccessToken}`);
    return {
      Authorization: `Basic ${token}`,
    };
  }

  async getProjects(): Promise<Project[]> {
    if (!this.config) throw new Error("Azure DevOps configuration not set");
    
    const response = await axios.get(
      `${BASE_URL}${this.config.organizationName}/_apis/projects?api-version=7.0`,
      { headers: this.getAuthHeaders() }
    );
    
    return response.data.value;
  }

  async getWorkItems(projectName: string, query: string = ""): Promise<WorkItem[]> {
    if (!this.config) throw new Error("Azure DevOps configuration not set");
    
    // First get the work item IDs
    const wiql = {
      query: query || "Select [System.Id] From WorkItems Where [System.TeamProject] = @project Order By [System.ChangedDate] Desc"
    };
    
    const wiqlResponse = await axios.post(
      `${BASE_URL}${this.config.organizationName}/${projectName}/_apis/wit/wiql?api-version=7.0`,
      wiql,
      { headers: this.getAuthHeaders() }
    );
    
    const workItemIds = wiqlResponse.data.workItems.map((item: any) => item.id);
    
    if (workItemIds.length === 0) return [];
    
    // Then get the work item details
    const workItemsResponse = await axios.get(
      `${BASE_URL}${this.config.organizationName}/_apis/wit/workitems?ids=${workItemIds.join(",")}&$expand=all&api-version=7.0`,
      { headers: this.getAuthHeaders() }
    );
    
    return workItemsResponse.data.value;
  }

  async getTeamMembers(projectName: string): Promise<TeamMember[]> {
    if (!this.config) throw new Error("Azure DevOps configuration not set");
    
    const response = await axios.get(
      `${BASE_URL}${this.config.organizationName}/_apis/projects/${projectName}/teams/default/members?api-version=7.0`,
      { headers: this.getAuthHeaders() }
    );
    
    return response.data.value;
  }

  async getWorkItemTypes(projectName: string): Promise<string[]> {
    if (!this.config) throw new Error("Azure DevOps configuration not set");
    
    const response = await axios.get(
      `${BASE_URL}${this.config.organizationName}/${projectName}/_apis/wit/workitemtypes?api-version=7.0`,
      { headers: this.getAuthHeaders() }
    );
    
    return response.data.value.map((type: any) => type.name);
  }

  async updateWorkItem(projectName: string, workItemId: number, updates: WorkItemUpdate): Promise<WorkItem> {
    if (!this.config) throw new Error("Azure DevOps configuration not set");
    
    const operations = [];
    
    if (updates.title) {
      operations.push({
        op: "add",
        path: "/fields/System.Title",
        value: updates.title
      });
    }
    
    if (updates.description) {
      operations.push({
        op: "add",
        path: "/fields/System.Description",
        value: updates.description
      });
    }
    
    if (updates.state) {
      operations.push({
        op: "add",
        path: "/fields/System.State",
        value: updates.state
      });
    }
    
    if (updates.assignedTo) {
      operations.push({
        op: "add",
        path: "/fields/System.AssignedTo",
        value: updates.assignedTo
      });
    }
    
    console.log("Updating work item with operations:", JSON.stringify(operations));
    
    const response = await axios.patch(
      `${BASE_URL}${this.config.organizationName}/_apis/wit/workitems/${workItemId}?api-version=7.0`,
      operations,
      {
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json-patch+json"
        }
      }
    );
    
    console.log("Update response:", JSON.stringify(response.data));
    return response.data;
  }

  // Helper method to get a work item for storage in a database
  formatWorkItemForStorage(workItem: WorkItem) {
    const { fields } = workItem;
    return {
      id: workItem.id,
      title: fields["System.Title"],
      description: fields["System.Description"] || "",
      state: fields["System.State"],
      workItemType: fields["System.WorkItemType"],
      createdDate: fields["System.CreatedDate"],
      changedDate: fields["System.ChangedDate"],
      createdBy: fields["System.CreatedBy"]?.displayName,
      assignedTo: fields["System.AssignedTo"]?.displayName || null,
      // Add any other fields you want to store
    };
  }
}

export { type WorkItemUpdate };
export const azureDevOpsService = new AzureDevOpsService();
