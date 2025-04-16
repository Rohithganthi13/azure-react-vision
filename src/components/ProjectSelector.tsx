
import { useAzureDevOps } from "@/contexts/AzureDevOpsContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project } from "@/services/azureDevOpsService";

const ProjectSelector = () => {
  const { projects, selectProject, selectedProject } = useAzureDevOps();

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      selectProject(project);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <Select
        onValueChange={handleProjectChange}
        value={selectedProject?.id || ""}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProjectSelector;
