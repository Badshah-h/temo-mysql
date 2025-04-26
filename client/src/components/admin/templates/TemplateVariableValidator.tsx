import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface TemplateVariableValidatorProps {
  templateContent: string;
  availableVariables?: string[];
}

const TemplateVariableValidator: React.FC<TemplateVariableValidatorProps> = ({
  templateContent,
  availableVariables = [],
}) => {
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);
  const [missingVariables, setMissingVariables] = useState<string[]>([]);
  const [unusedVariables, setUnusedVariables] = useState<string[]>([]);

  useEffect(() => {
    // Extract variables from template content using regex
    const regex = /{{\s*([\w.]+)\s*}}/g;
    const matches = [];
    let match;

    while ((match = regex.exec(templateContent)) !== null) {
      matches.push(match[1]);
    }

    // Remove duplicates
    const uniqueVariables = [...new Set(matches)];
    setDetectedVariables(uniqueVariables);

    // Find missing variables (in template but not in available list)
    const missing = uniqueVariables.filter(
      (variable) => !availableVariables.includes(variable),
    );
    setMissingVariables(missing);

    // Find unused variables (in available list but not in template)
    const unused = availableVariables.filter(
      (variable) => !uniqueVariables.includes(variable),
    );
    setUnusedVariables(unused);
  }, [templateContent, availableVariables]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Variable Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {missingVariables.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {missingVariables.length} variable
              {missingVariables.length !== 1 ? "s" : ""} in your template{" "}
              {missingVariables.length !== 1 ? "are" : "is"} not available in
              the system.
            </AlertDescription>
          </Alert>
        )}

        {missingVariables.length === 0 && detectedVariables.length > 0 && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              All template variables are available in the system.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            Detected Variables ({detectedVariables.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {detectedVariables.length > 0 ? (
              detectedVariables.map((variable) => (
                <Badge
                  key={variable}
                  variant={
                    missingVariables.includes(variable)
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {variable}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No variables detected in template
              </p>
            )}
          </div>
        </div>

        {unusedVariables.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              Available but Unused Variables ({unusedVariables.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {unusedVariables.map((variable) => (
                <Badge key={variable} variant="outline">
                  {variable}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {missingVariables.length > 0 && (
          <div className="pt-2">
            <Button variant="outline" size="sm" className="w-full">
              Add Missing Variables to System
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateVariableValidator;
