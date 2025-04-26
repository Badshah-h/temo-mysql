import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Save, Plus, Trash2, MoveUp, MoveDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  responseFormatApi,
  ResponseFormat,
  ResponseFormatStructure,
} from "@/api/responseFormatApi";
import ResponseFormatPreview from "./ResponseFormatPreview";

// Define the schema for the form
const formatSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  isGlobal: z.boolean().default(false),
  structure: z.object({
    title: z.string().optional(),
    intro: z.string().optional(),
    content_blocks: z
      .array(
        z.object({
          type: z.enum([
            "text",
            "list",
            "code",
            "quote",
            "image",
            "table",
            "custom",
          ]),
          heading: z.string().optional(),
          content: z.any(),
        }),
      )
      .optional(),
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .optional(),
    actions: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().optional(),
          type: z.enum(["link", "button", "download", "copy"]),
          style: z
            .enum(["primary", "secondary", "outline", "ghost"])
            .optional(),
        }),
      )
      .optional(),
    disclaimer: z.string().optional(),
  }),
});

type FormatFormValues = z.infer<typeof formatSchema>;

interface ResponseFormatFormProps {
  formatId?: number;
  onSaved?: (format: ResponseFormat) => void;
  onCancel?: () => void;
}

const ResponseFormatForm: React.FC<ResponseFormatFormProps> = ({
  formatId,
  onSaved,
  onCancel,
}) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [previewContent, setPreviewContent] = useState(
    "This is a sample response that will be formatted according to your template. You can see how your format will look with actual content.",
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormatFormValues>({
    resolver: zodResolver(formatSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      tags: "",
      isGlobal: false,
      structure: {
        title: "",
        intro: "",
        content_blocks: [
          {
            type: "text",
            heading: "",
            content: "",
          },
        ],
        faq: [],
        actions: [],
        disclaimer: "",
      },
    },
  });

  const {
    fields: contentBlocks,
    append: appendContentBlock,
    remove: removeContentBlock,
    move: moveContentBlock,
  } = useFieldArray({
    control,
    name: "structure.content_blocks",
  });

  const {
    fields: faqItems,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control,
    name: "structure.faq",
  });

  const {
    fields: actionItems,
    append: appendAction,
    remove: removeAction,
  } = useFieldArray({
    control,
    name: "structure.actions",
  });

  const watchedStructure = watch("structure");
  const selectedCategory = watch("category");

  const fetchCategories = async () => {
    try {
      // In a real implementation, this would call the API
      // const response = await responseFormatApi.getCategories(token);
      // setCategories(response);

      // Mock categories for development
      setCategories(["General", "Support", "Technical", "Marketing", "Legal"]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchFormat = async () => {
    if (!formatId || !token) return;

    try {
      setLoading(true);
      // In a real implementation, this would call the API
      // const format = await responseFormatApi.getFormat(formatId, token);

      // Mock data for development
      const format: ResponseFormat = {
        id: formatId,
        name: "Technical Documentation",
        description: "Format for technical explanations with code examples",
        structure: {
          title: "Technical Guide",
          intro: "Technical explanation:",
          content_blocks: [
            {
              type: "text",
              heading: "Overview",
              content: "Overview content",
            },
            {
              type: "code",
              heading: "Code Example",
              content: "console.log('Hello world');",
            },
          ],
          actions: [
            {
              label: "View Documentation",
              type: "link",
              style: "primary",
            },
          ],
        },
        category: "Technical",
        tags: ["code", "documentation"],
        isGlobal: false,
        usageCount: 87,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      reset({
        name: format.name,
        description: format.description || "",
        category: format.category || "",
        tags: format.tags?.join(", ") || "",
        isGlobal: format.isGlobal,
        structure: {
          title: format.structure.title || "",
          intro: format.structure.intro || "",
          content_blocks: format.structure.content_blocks || [],
          faq: format.structure.faq || [],
          actions: format.structure.actions || [],
          disclaimer: format.structure.disclaimer || "",
        },
      });
    } catch (error) {
      console.error("Error fetching format:", error);
      toast({
        title: "Error",
        description: "Failed to load response format",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchFormat();
  }, [formatId, token]);

  const onSubmit = async (data: FormatFormValues) => {
    try {
      setLoading(true);

      // Process tags from comma-separated string to array
      const processedTags = data.tags
        ? data.tags.split(",").map((tag) => tag.trim())
        : [];

      const formatData = {
        ...data,
        tags: processedTags,
      };

      let response;

      if (formatId) {
        // Update existing format
        // In a real implementation, this would call the API
        // response = await responseFormatApi.updateFormat(formatId, formatData, token);
        response = { ...formatData, id: formatId };

        toast({
          title: "Success",
          description: "Response format updated successfully",
        });
      } else {
        // Create new format
        // In a real implementation, this would call the API
        // response = await responseFormatApi.createFormat(formatData, token);
        response = { ...formatData, id: Math.floor(Math.random() * 1000) };

        toast({
          title: "Success",
          description: "Response format created successfully",
        });
      }

      if (onSaved) {
        onSaved(response as ResponseFormat);
      } else {
        navigate("/admin/response-formats");
      }
    } catch (error) {
      console.error("Error saving response format:", error);
      toast({
        title: "Error",
        description: "Failed to save response format",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/admin/response-formats");
    }
  };

  const addContentBlock = (type: string) => {
    let newBlock: any = {
      type,
      heading: "",
    };

    switch (type) {
      case "text":
        newBlock.content = "";
        break;
      case "list":
        newBlock.content = ["Item 1", "Item 2", "Item 3"];
        break;
      case "code":
        newBlock.content = "// Add your code here";
        break;
      case "quote":
        newBlock.content = "Add your quote here";
        break;
      case "image":
        newBlock.content = { url: "", alt: "" };
        break;
      case "table":
        newBlock.content = {
          headers: ["Header 1", "Header 2"],
          rows: [
            ["Cell 1-1", "Cell 1-2"],
            ["Cell 2-1", "Cell 2-2"],
          ],
        };
        break;
      case "custom":
        newBlock.content = {};
        break;
    }

    appendContentBlock(newBlock);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {formatId ? "Edit Response Format" : "Create New Response Format"}
        </h2>
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="structure">Format Structure</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <form className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name{" "}
                      {errors.name && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Format name (e.g., Technical Documentation)"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Brief description of this response format"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={selectedCategory}
                        onValueChange={(value) => setValue("category", value)}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                          {/* Allow custom category */}
                          <div className="p-2 border-t">
                            <Input
                              placeholder="Or enter a new category"
                              onChange={(e) =>
                                setValue("category", e.target.value)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        {...register("tags")}
                        placeholder="technical, documentation, code"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="isGlobal">Global Format</Label>
                      <p className="text-sm text-muted-foreground">
                        Make this format available to all users
                      </p>
                    </div>
                    <Switch
                      id="isGlobal"
                      checked={watch("isGlobal")}
                      onCheckedChange={(checked) =>
                        setValue("isGlobal", checked)
                      }
                    />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="structure.title">Title</Label>
                  <Input
                    id="structure.title"
                    {...register("structure.title")}
                    placeholder="Response title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="structure.intro">Introduction</Label>
                  <Textarea
                    id="structure.intro"
                    {...register("structure.intro")}
                    placeholder="Introductory text for the response"
                    rows={2}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Content Blocks</Label>
                    <div className="flex gap-2">
                      <Select onValueChange={addContentBlock}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Add block" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text Block</SelectItem>
                          <SelectItem value="list">List</SelectItem>
                          <SelectItem value="code">Code Block</SelectItem>
                          <SelectItem value="quote">Quote</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="table">Table</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {contentBlocks.map((field, index) => (
                      <Card key={field.id} className="relative">
                        <CardContent className="pt-6">
                          <div className="absolute right-2 top-2 flex gap-1">
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  moveContentBlock(index, index - 1)
                                }
                              >
                                <MoveUp className="h-4 w-4" />
                              </Button>
                            )}
                            {index < contentBlocks.length - 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  moveContentBlock(index, index + 1)
                                }
                              >
                                <MoveDown className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeContentBlock(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2 mb-4">
                            <Badge>{field.type}</Badge>
                            <Input
                              {...register(
                                `structure.content_blocks.${index}.heading`,
                              )}
                              placeholder="Block heading (optional)"
                              className="flex-1"
                            />
                          </div>

                          {field.type === "text" && (
                            <Textarea
                              {...register(
                                `structure.content_blocks.${index}.content`,
                              )}
                              placeholder="Text content"
                              rows={3}
                            />
                          )}

                          {field.type === "list" && (
                            <div className="space-y-2">
                              <Label>List Items (one per line)</Label>
                              <Textarea
                                value={
                                  Array.isArray(
                                    watch(
                                      `structure.content_blocks.${index}.content`,
                                    ),
                                  )
                                    ? watch(
                                        `structure.content_blocks.${index}.content`,
                                      ).join("\n")
                                    : ""
                                }
                                onChange={(e) => {
                                  const items = e.target.value
                                    .split("\n")
                                    .filter(Boolean);
                                  setValue(
                                    `structure.content_blocks.${index}.content`,
                                    items,
                                  );
                                }}
                                placeholder="Item 1\nItem 2\nItem 3"
                                rows={4}
                              />
                            </div>
                          )}

                          {field.type === "code" && (
                            <Textarea
                              {...register(
                                `structure.content_blocks.${index}.content`,
                              )}
                              placeholder="// Code content"
                              rows={5}
                              className="font-mono text-sm"
                            />
                          )}

                          {field.type === "quote" && (
                            <Textarea
                              {...register(
                                `structure.content_blocks.${index}.content`,
                              )}
                              placeholder="Quote content"
                              rows={3}
                            />
                          )}

                          {field.type === "image" && (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <Label>Image URL</Label>
                                <Input
                                  value={
                                    watch(
                                      `structure.content_blocks.${index}.content.url`,
                                    ) || ""
                                  }
                                  onChange={(e) => {
                                    setValue(
                                      `structure.content_blocks.${index}.content.url`,
                                      e.target.value,
                                    );
                                  }}
                                  placeholder="https://example.com/image.jpg"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Alt Text</Label>
                                <Input
                                  value={
                                    watch(
                                      `structure.content_blocks.${index}.content.alt`,
                                    ) || ""
                                  }
                                  onChange={(e) => {
                                    setValue(
                                      `structure.content_blocks.${index}.content.alt`,
                                      e.target.value,
                                    );
                                  }}
                                  placeholder="Image description"
                                />
                              </div>
                            </div>
                          )}

                          {field.type === "table" && (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <Label>Headers (comma separated)</Label>
                                <Input
                                  value={
                                    watch(
                                      `structure.content_blocks.${index}.content.headers`,
                                    )?.join(", ") || ""
                                  }
                                  onChange={(e) => {
                                    const headers = e.target.value
                                      .split(",")
                                      .map((h) => h.trim());
                                    setValue(
                                      `structure.content_blocks.${index}.content.headers`,
                                      headers,
                                    );
                                  }}
                                  placeholder="Header 1, Header 2, Header 3"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>
                                  Rows (one row per line, cells separated by
                                  commas)
                                </Label>
                                <Textarea
                                  value={
                                    watch(
                                      `structure.content_blocks.${index}.content.rows`,
                                    )
                                      ?.map((row) => row.join(", "))
                                      .join("\n") || ""
                                  }
                                  onChange={(e) => {
                                    const rows = e.target.value
                                      .split("\n")
                                      .map((row) =>
                                        row
                                          .split(",")
                                          .map((cell) => cell.trim()),
                                      );
                                    setValue(
                                      `structure.content_blocks.${index}.content.rows`,
                                      rows,
                                    );
                                  }}
                                  placeholder="Cell 1-1, Cell 1-2\nCell 2-1, Cell 2-2"
                                  rows={4}
                                />
                              </div>
                            </div>
                          )}

                          {field.type === "custom" && (
                            <div className="space-y-2">
                              <Label>Custom JSON Content</Label>
                              <Textarea
                                value={JSON.stringify(
                                  watch(
                                    `structure.content_blocks.${index}.content`,
                                  ) || {},
                                  null,
                                  2,
                                )}
                                onChange={(e) => {
                                  try {
                                    const json = JSON.parse(e.target.value);
                                    setValue(
                                      `structure.content_blocks.${index}.content`,
                                      json,
                                    );
                                  } catch (error) {
                                    // Handle invalid JSON
                                  }
                                }}
                                placeholder='{"key": "value"}'
                                rows={5}
                                className="font-mono text-sm"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {contentBlocks.length === 0 && (
                      <div className="text-center py-8 border border-dashed rounded-md">
                        <p className="text-muted-foreground">
                          No content blocks added yet
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => addContentBlock("text")}
                          className="mt-2"
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Text Block
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>FAQ Items</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendFaq({ question: "", answer: "" })}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add FAQ
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {faqItems.map((field, index) => (
                      <Card key={field.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFaq(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Question</Label>
                              <Input
                                {...register(`structure.faq.${index}.question`)}
                                placeholder="FAQ question"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Answer</Label>
                              <Textarea
                                {...register(`structure.faq.${index}.answer`)}
                                placeholder="FAQ answer"
                                rows={3}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {faqItems.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        No FAQ items added yet
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Action Buttons</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendAction({
                          label: "",
                          type: "button",
                          style: "primary",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Action
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {actionItems.map((field, index) => (
                      <Card key={field.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAction(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Label</Label>
                              <Input
                                {...register(
                                  `structure.actions.${index}.label`,
                                )}
                                placeholder="Button text"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>URL (for links)</Label>
                              <Input
                                {...register(`structure.actions.${index}.url`)}
                                placeholder="https://example.com"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select
                                value={watch(`structure.actions.${index}.type`)}
                                onValueChange={(
                                  value:
                                    | "link"
                                    | "button"
                                    | "download"
                                    | "copy",
                                ) =>
                                  setValue(
                                    `structure.actions.${index}.type`,
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="link">Link</SelectItem>
                                  <SelectItem value="button">Button</SelectItem>
                                  <SelectItem value="download">
                                    Download
                                  </SelectItem>
                                  <SelectItem value="copy">
                                    Copy to Clipboard
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Style</Label>
                              <Select
                                value={
                                  watch(`structure.actions.${index}.style`) ||
                                  "primary"
                                }
                                onValueChange={(
                                  value:
                                    | "primary"
                                    | "secondary"
                                    | "outline"
                                    | "ghost",
                                ) =>
                                  setValue(
                                    `structure.actions.${index}.style`,
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select style" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="primary">
                                    Primary
                                  </SelectItem>
                                  <SelectItem value="secondary">
                                    Secondary
                                  </SelectItem>
                                  <SelectItem value="outline">
                                    Outline
                                  </SelectItem>
                                  <SelectItem value="ghost">Ghost</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {actionItems.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        No action buttons added yet
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="structure.disclaimer">Disclaimer</Label>
                  <Textarea
                    id="structure.disclaimer"
                    {...register("structure.disclaimer")}
                    placeholder="Optional disclaimer text"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sample Content for Preview</Label>
                  <Textarea
                    value={previewContent}
                    onChange={(e) => setPreviewContent(e.target.value)}
                    placeholder="Enter sample content to see how it would be formatted"
                    rows={4}
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-medium mb-4">Preview</h3>
                  <div className="border rounded-md p-4 bg-white">
                    <ResponseFormatPreview
                      structure={watchedStructure as ResponseFormatStructure}
                      content={previewContent}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            "Saving..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {formatId ? "Update" : "Create"} Format
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ResponseFormatForm;
