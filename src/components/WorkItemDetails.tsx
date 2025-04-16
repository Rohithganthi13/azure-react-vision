
import { WorkItem } from "@/services/azureDevOpsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/dateUtils";

interface WorkItemDetailsProps {
  workItem: WorkItem;
  onClose: () => void;
}

const WorkItemDetails = ({ workItem, onClose }: WorkItemDetailsProps) => {
  const { fields } = workItem;

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>#{workItem.id} - {fields["System.Title"]}</CardTitle>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          ×
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium mb-2">Type</h4>
            <p>{fields["System.WorkItemType"]}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">State</h4>
            <Badge>{fields["System.State"]}</Badge>
          </div>
          <div>
            <h4 className="font-medium mb-2">Priority</h4>
            <p>{fields["Microsoft.VSTS.Common.Priority"] || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Created Date</h4>
            <p>{formatDate(fields["System.CreatedDate"])}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Assigned To</h4>
            <p>{fields["System.AssignedTo"]?.displayName || "Unassigned"}</p>
          </div>
        </div>
        {fields["System.Tags"] && (
          <div>
            <h4 className="font-medium mb-2">Tags</h4>
            <div className="flex gap-2 flex-wrap">
              {fields["System.Tags"].split(';').map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag.trim()}</Badge>
              ))}
            </div>
          </div>
        )}
        {fields["System.Description"] && (
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: fields["System.Description"] }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkItemDetails;
