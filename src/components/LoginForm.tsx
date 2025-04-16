
import { useState } from "react";
import { useAzureDevOps } from "@/contexts/AzureDevOpsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import AzureDevOpsGuide from "./AzureDevOpsGuide";

const LoginForm = () => {
  const { login, isLoading, error } = useAzureDevOps();
  const [organizationName, setOrganizationName] = useState("");
  const [personalAccessToken, setPersonalAccessToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({
      organizationName,
      personalAccessToken,
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto relative">
      <AzureDevOpsGuide />
      <CardHeader>
        <CardTitle className="text-2xl">Azure DevOps Login</CardTitle>
        <CardDescription>
          Enter your Azure DevOps organization name and personal access token to connect
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="organizationName">Organization Name</Label>
            <Input
              id="organizationName"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="your-organization"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pat">Personal Access Token</Label>
            <Input
              id="pat"
              type="password"
              value={personalAccessToken}
              onChange={(e) => setPersonalAccessToken(e.target.value)}
              placeholder="Personal Access Token (PAT)"
              required
            />
            <p className="text-xs text-muted-foreground">
              Your PAT needs 'Read' permissions for Work Items and Project and Team
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Connecting..." : "Connect to Azure DevOps"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
