import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PromptTemplatePreviewProps {
  template: {
    name: string;
    description?: string;
    content: string;
    category?: string;
    tags?: string[];
    isGlobal?: boolean;
  } | null;
}

const PromptTemplatePreview: React.FC<PromptTemplatePreviewProps> = ({
  template,
}) => {
  const [variables, setVariables] = useState<Record<string, string>>({});

  if (!template) {
    return <div className="text-center py-8">No template to preview</div>;
  }

  // Extract variables from template content using regex
  const extractVariables = (content: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      matches.push(match[1].trim());
    }

    return [...new Set(matches)]; // Remove duplicates
  };

  const templateVariables = extractVariables(template.content);

  // Replace variables in content
  const processedContent =
    templateVariables.length > 0
      ? template.content.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
          const varName = variable.trim();
          return variables[varName] || match;
        })
      : template.content;

  const handleVariableChange = (variable: string, value: string) => {
    setVariables((prev) => ({
      ...prev,
      [variable]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {templateVariables.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Template Variables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templateVariables.map((variable) => (
              <div key={variable} className="space-y-2">
                <Label htmlFor={`var-${variable}`}>{variable}</Label>
                <Input
                  id={`var-${variable}`}
                  value={variables[variable] || ""}
                  onChange={(e) =>
                    handleVariableChange(variable, e.target.value)
                  }
                  placeholder={`Value for ${variable}`}
                />
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={() => setVariables({})} size="sm">
            Reset Variables
          </Button>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Preview</h3>
        <Card className="bg-slate-50 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{template.name}</span>
              {template.isGlobal ? (
                <Badge>Global</Badge>
              ) : (
                <Badge variant="outline">Private</Badge>
              )}
            </CardTitle>
            {template.description && (
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            )}
            {template.category && (
              <Badge variant="secondary">{template.category}</Badge>
            )}
            {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {template.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap font-mono text-sm bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
              {processedContent}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromptTemplatePreview;
