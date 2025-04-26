import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2, Copy } from "lucide-react";

interface PromptTemplateCardProps {
  template: {
    id: number;
    name: string;
    description?: string;
    content: string;
    category?: string;
    tags?: string[];
    isGlobal: boolean;
    usageCount: number;
    createdAt: string;
    creator?: {
      id: number;
      fullName: string;
    };
  };
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  onUse?: () => void;
}

const PromptTemplateCard: React.FC<PromptTemplateCardProps> = ({
  template,
  onEdit,
  onView,
  onDelete,
  onUse,
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Truncate content for preview
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return `${content.substring(0, maxLength)}...`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          {template.isGlobal ? (
            <Badge>Global</Badge>
          ) : (
            <Badge variant="outline">Private</Badge>
          )}
        </div>
        {template.category && (
          <Badge variant="secondary" className="mt-1">
            {template.category}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-grow">
        {template.description && (
          <p className="text-sm text-muted-foreground mb-2">
            {template.description}
          </p>
        )}

        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md text-sm font-mono whitespace-pre-wrap mb-3">
          {truncateContent(template.content)}
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {template.tags?.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 pt-0">
        <div className="w-full flex justify-between text-xs text-muted-foreground">
          <span>Used {template.usageCount} times</span>
          <span>Created {formatDate(template.createdAt)}</span>
        </div>

        <div className="w-full flex justify-between">
          <div className="space-x-1">
            {onView && (
              <Button variant="ghost" size="sm" onClick={onView}>
                <Eye className="h-4 w-4 mr-1" /> View
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
          </div>

          <div className="space-x-1">
            {onUse && (
              <Button variant="outline" size="sm" onClick={onUse}>
                <Copy className="h-4 w-4 mr-1" /> Use
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PromptTemplateCard;
