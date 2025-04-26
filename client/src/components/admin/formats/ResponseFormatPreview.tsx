import React from "react";
import { ResponseFormatStructure } from "@/api/responseFormatApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ResponseFormatPreviewProps {
  structure: ResponseFormatStructure;
  content: string;
}

const ResponseFormatPreview: React.FC<ResponseFormatPreviewProps> = ({
  structure,
  content,
}) => {
  // In a real implementation, this would use the actual AI-processed content
  // For now, we'll just use the structure and sample content to demonstrate the format

  const renderContentBlock = (block: any) => {
    switch (block.type) {
      case "text":
        return (
          <div className="mb-4">
            {block.heading && (
              <h3 className="text-lg font-medium mb-2">{block.heading}</h3>
            )}
            <p>{block.content || content}</p>
          </div>
        );
      case "list":
        return (
          <div className="mb-4">
            {block.heading && (
              <h3 className="text-lg font-medium mb-2">{block.heading}</h3>
            )}
            <ul className="list-disc pl-5 space-y-1">
              {Array.isArray(block.content) && block.content.length > 0
                ? block.content.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))
                : [
                    "Sample list item 1",
                    "Sample list item 2",
                    "Sample list item 3",
                  ].map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        );
      case "code":
        return (
          <div className="mb-4">
            {block.heading && (
              <h3 className="text-lg font-medium mb-2">{block.heading}</h3>
            )}
            <pre className="bg-slate-100 p-3 rounded-md overflow-x-auto font-mono text-sm">
              {block.content ||
                "// Sample code block\nfunction example() {\n  return 'Hello world';\n}"}
            </pre>
          </div>
        );
      case "quote":
        return (
          <div className="mb-4">
            {block.heading && (
              <h3 className="text-lg font-medium mb-2">{block.heading}</h3>
            )}
            <blockquote className="border-l-4 border-slate-300 pl-4 italic">
              {block.content || "This is a sample quote or testimonial."}
            </blockquote>
          </div>
        );
      case "image":
        return (
          <div className="mb-4">
            {block.heading && (
              <h3 className="text-lg font-medium mb-2">{block.heading}</h3>
            )}
            <figure>
              <img
                src={
                  block.content?.url || "https://via.placeholder.com/800x400"
                }
                alt={block.content?.alt || "Sample image"}
                className="rounded-md max-w-full"
              />
              {block.content?.caption && (
                <figcaption className="text-sm text-center mt-2 text-muted-foreground">
                  {block.content.caption}
                </figcaption>
              )}
            </figure>
          </div>
        );
      case "table":
        return (
          <div className="mb-4 overflow-x-auto">
            {block.heading && (
              <h3 className="text-lg font-medium mb-2">{block.heading}</h3>
            )}
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  {block.content?.headers
                    ? block.content.headers.map((header: string, i: number) => (
                        <th key={i} className="border px-4 py-2 text-left">
                          {header}
                        </th>
                      ))
                    : ["Header 1", "Header 2", "Header 3"].map((header, i) => (
                        <th key={i} className="border px-4 py-2 text-left">
                          {header}
                        </th>
                      ))}
                </tr>
              </thead>
              <tbody>
                {block.content?.rows
                  ? block.content.rows.map((row: string[], i: number) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className="border px-4 py-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  : [
                      ["Row 1, Cell 1", "Row 1, Cell 2", "Row 1, Cell 3"],
                      ["Row 2, Cell 1", "Row 2, Cell 2", "Row 2, Cell 3"],
                    ].map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className="border px-4 py-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        );
      case "custom":
        return (
          <div className="mb-4">
            {block.heading && (
              <h3 className="text-lg font-medium mb-2">{block.heading}</h3>
            )}
            <Card>
              <CardContent className="p-4">
                <pre className="text-sm">
                  {JSON.stringify(block.content || { custom: "data" }, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="response-format-preview">
      {structure.title && (
        <h2 className="text-xl font-bold mb-2">{structure.title}</h2>
      )}

      {structure.intro && (
        <p className="text-muted-foreground mb-4">{structure.intro}</p>
      )}

      {structure.content_blocks?.map((block, index) => (
        <React.Fragment key={index}>{renderContentBlock(block)}</React.Fragment>
      ))}

      {structure.faq && structure.faq.length > 0 && (
        <div className="my-6">
          <h3 className="text-lg font-medium mb-4">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {structure.faq.map((item, index) => (
              <div
                key={index}
                className="pb-3 border-b border-slate-200 last:border-0"
              >
                <h4 className="font-medium mb-1">
                  {item.question || "Sample question?"}
                </h4>
                <p className="text-muted-foreground">
                  {item.answer || "Sample answer to the question."}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {structure.actions && structure.actions.length > 0 && (
        <div className="flex flex-wrap gap-2 my-4">
          {structure.actions.map((action, index) => {
            const variant = action.style || "primary";
            return (
              <Button key={index} variant={variant as any} asChild>
                <a
                  href={action.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {action.label || "Action Button"}
                </a>
              </Button>
            );
          })}
        </div>
      )}

      {structure.disclaimer && (
        <div className="mt-6 text-sm text-muted-foreground border-t pt-3">
          {structure.disclaimer}
        </div>
      )}
    </div>
  );
};

export default ResponseFormatPreview;
