import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Edit,
  Trash2,
  MoreVertical,
  Plus,
  Search,
  Eye,
  FileJson,
} from "lucide-react";
import { responseFormatApi, ResponseFormat } from "@/api/responseFormatApi";

interface ResponseFormatListProps {
  onCreateNew?: () => void;
  onEdit?: (format: ResponseFormat) => void;
  onView?: (format: ResponseFormat) => void;
}

const ResponseFormatList: React.FC<ResponseFormatListProps> = ({
  onCreateNew,
  onEdit,
  onView,
}) => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formats, setFormats] = useState<ResponseFormat[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showGlobalOnly, setShowGlobalOnly] = useState(false);
  const [showMyFormats, setShowMyFormats] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchFormats = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        category: selectedCategory,
        isGlobal: showGlobalOnly || undefined,
        createdBy: showMyFormats && user ? user.id : undefined,
        sortBy,
        sortOrder,
      };

      // In a real implementation, this would call the API
      // For now, we'll use mock data
      // const response = await responseFormatApi.getFormats(params, token);
      // setFormats(response.formats);
      // setTotalPages(response.pagination.totalPages);

      // Mock data for development
      const mockFormats: ResponseFormat[] = [
        {
          id: 1,
          name: "Standard Response",
          description: "Default format for general responses",
          structure: {
            title: "Response",
            intro: "Here's what I found:",
            content_blocks: [
              {
                type: "text",
                content: "Main content goes here",
              },
            ],
            disclaimer: "This information is provided as guidance only.",
          },
          category: "General",
          tags: ["standard", "default"],
          isGlobal: true,
          usageCount: 245,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: "FAQ Format",
          description: "Format optimized for frequently asked questions",
          structure: {
            title: "FAQ Response",
            intro: "Here are answers to your questions:",
            faq: [
              {
                question: "Sample question?",
                answer: "Sample answer",
              },
            ],
          },
          category: "Support",
          tags: ["faq", "questions"],
          isGlobal: true,
          usageCount: 128,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 3,
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
        },
      ];

      setFormats(mockFormats);
      setTotalPages(1);

      // Mock categories
      setCategories(["General", "Support", "Technical", "Marketing", "Legal"]);
    } catch (error) {
      console.error("Error fetching response formats:", error);
      toast({
        title: "Error",
        description: "Failed to load response formats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormats();
  }, [currentPage, sortBy, sortOrder, token]);

  useEffect(() => {
    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchFormats();
    }
  }, [searchTerm, selectedCategory, showGlobalOnly, showMyFormats]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this format?")) {
      return;
    }

    try {
      // In a real implementation, this would call the API
      // await responseFormatApi.deleteFormat(id, token);

      toast({
        title: "Success",
        description: "Format deleted successfully",
      });

      fetchFormats();
    } catch (error) {
      console.error("Error deleting format:", error);
      toast({
        title: "Error",
        description: "Failed to delete format",
        variant: "destructive",
      });
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFormats();
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      navigate("/admin/response-formats/new");
    }
  };

  const handleEdit = (format: ResponseFormat) => {
    if (onEdit) {
      onEdit(format);
    } else {
      navigate(`/admin/response-formats/edit/${format.id}`);
    }
  };

  const handleView = (format: ResponseFormat) => {
    if (onView) {
      onView(format);
    } else {
      navigate(`/admin/response-formats/${format.id}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Response Formats</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" /> Create New Format
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search formats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="w-full md:w-48">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showGlobal"
            checked={showGlobalOnly}
            onCheckedChange={(checked) => setShowGlobalOnly(!!checked)}
          />
          <label htmlFor="showGlobal" className="text-sm font-medium">
            Global Only
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showMine"
            checked={showMyFormats}
            onCheckedChange={(checked) => setShowMyFormats(!!checked)}
          />
          <label htmlFor="showMine" className="text-sm font-medium">
            My Formats
          </label>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                Category{" "}
                {sortBy === "category" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Structure</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("usageCount")}
              >
                Usage{" "}
                {sortBy === "usageCount" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Global</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading formats...
                </TableCell>
              </TableRow>
            ) : formats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No formats found
                </TableCell>
              </TableRow>
            ) : (
              formats.map((format) => (
                <TableRow key={format.id}>
                  <TableCell className="font-medium">{format.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {format.description || "—"}
                  </TableCell>
                  <TableCell>{format.category || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {Object.keys(format.structure).length} sections
                      </Badge>
                      <FileJson className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>{format.usageCount}</TableCell>
                  <TableCell>
                    {format.isGlobal ? (
                      <Badge>Global</Badge>
                    ) : (
                      <Badge variant="outline">Private</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(format)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(format)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(format.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ResponseFormatList;
