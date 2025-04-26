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
import { Edit, Trash2, MoreVertical, Plus, Search, Eye } from "lucide-react";
import axios from "axios";

interface PromptTemplate {
  id: number;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  isGlobal: boolean;
  usageCount: number;
  createdAt: string;
  creator?: {
    id: number;
    fullName: string;
    email: string;
  };
}

interface PromptTemplateListProps {
  onCreateNew?: () => void;
  onEdit?: (template: PromptTemplate) => void;
  onView?: (template: PromptTemplate) => void;
}

const PromptTemplateList: React.FC<PromptTemplateListProps> = ({
  onCreateNew,
  onEdit,
  onView,
}) => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showGlobalOnly, setShowGlobalOnly] = useState(false);
  const [showMyTemplates, setShowMyTemplates] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchTemplates = async () => {
    try {
      setLoading(true);

      let url = `/api/prompt-templates?page=${currentPage}&limit=10&sortBy=${sortBy}&sortOrder=${sortOrder}`;

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      if (selectedCategory) {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }

      if (showGlobalOnly) {
        url += "&isGlobal=true";
      }

      if (showMyTemplates && user) {
        url += `&createdBy=${user.id}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTemplates(response.data.templates);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/prompt-templates/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, [currentPage, sortBy, sortOrder, token]);

  useEffect(() => {
    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchTemplates();
    }
  }, [searchTerm, selectedCategory, showGlobalOnly, showMyTemplates]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      await axios.delete(`/api/prompt-templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
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
    fetchTemplates();
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      navigate("/admin/templates/new");
    }
  };

  const handleEdit = (template: PromptTemplate) => {
    if (onEdit) {
      onEdit(template);
    } else {
      navigate(`/admin/templates/edit/${template.id}`);
    }
  };

  const handleView = (template: PromptTemplate) => {
    if (onView) {
      onView(template);
    } else {
      navigate(`/admin/templates/${template.id}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Prompt Templates</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" /> Create New Template
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search templates..."
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
            checked={showMyTemplates}
            onCheckedChange={(checked) => setShowMyTemplates(!!checked)}
          />
          <label htmlFor="showMine" className="text-sm font-medium">
            My Templates
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
              <TableHead>Tags</TableHead>
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
                  Loading templates...
                </TableCell>
              </TableRow>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No templates found
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {template.description || "—"}
                  </TableCell>
                  <TableCell>{template.category || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {template.tags?.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                      {!template.tags?.length && "—"}
                    </div>
                  </TableCell>
                  <TableCell>{template.usageCount}</TableCell>
                  <TableCell>
                    {template.isGlobal ? (
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
                        <DropdownMenuItem onClick={() => handleView(template)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(template)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(template.id)}
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

export default PromptTemplateList;
