
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoIcon } from "lucide-react";

const AzureDevOpsGuide = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-2 right-2">
          <InfoIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>How to Get Your Azure DevOps Access Token</DialogTitle>
          <DialogDescription>
            Follow these steps to create a Personal Access Token (PAT) for Azure DevOps
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <h3 className="font-semibold">Step 1: Access Azure DevOps</h3>
            <p className="text-sm">
              Sign in to your Azure DevOps organization
              (<a 
                href="https://dev.azure.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-500 hover:underline"
              >
                https://dev.azure.com
              </a>).
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Step 2: Access User Settings</h3>
            <p className="text-sm">
              Click on your profile picture in the top right corner and select "Personal access tokens".
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Step 3: Create a New Token</h3>
            <p className="text-sm">
              Click on "New Token" button.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Step 4: Configure the Token</h3>
            <p className="text-sm">
              Fill in the following details:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Name: Give your token a meaningful name (e.g., "Azure DevOps Explorer")</li>
              <li>Organization: Select your organization</li>
              <li>Expiration: Choose an expiration date</li>
              <li>Scopes: Select "Custom defined" and then ensure the following permissions are granted:</li>
            </ul>
            <div className="pl-6 text-sm space-y-1">
              <p>- Work Items: <strong>Read</strong></p>
              <p>- Project and Team: <strong>Read</strong></p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Step 5: Create Token</h3>
            <p className="text-sm">
              Click the "Create" button at the bottom of the page.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Step 6: Copy Your Token</h3>
            <p className="text-sm">
              <strong>Important:</strong> Copy your token immediately and store it securely. You won't be able to see it again after you leave this page.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Step 7: Use Your Token</h3>
            <p className="text-sm">
              Return to this application and enter your organization name and the personal access token you just created.
            </p>
          </div>
          
          <div className="rounded-md bg-yellow-50 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <InfoIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Security Note</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Your Personal Access Token grants access to your Azure DevOps resources. For security:
                  </p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Never share your token with others</li>
                    <li>Set an appropriate expiration date</li>
                    <li>Use minimal permissions (scopes) needed</li>
                    <li>Revoke the token when no longer needed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AzureDevOpsGuide;
