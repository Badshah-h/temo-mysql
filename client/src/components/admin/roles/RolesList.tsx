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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Edit,
  Trash2,
  MoreVertical,
  Plus,
  Search,
  Users,
  Shield,
} from "lucide-react";
import axios from "axios";

interface Role {
  id: number;
  name: string;
  description?: string;
  permissionCount: number;
  userCount?: number;
  isBuiltIn?: boolean;
}

interface RolesListProps {
  onCreateNew?: () => void;
  onEdit?: (role: Role) => void;
  onView?: (role: Role) => void;
}

const RolesList: React.FC<RolesListProps> = ({
  onCreateNew,
  onEdit,
  onView,
}) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const API_BASE_URL = "/api/roles";

  const fetchRoles = async () => {
    try {
      setLoading(true);

      let url = `${API_BASE_URL}?page=${currentPage}&limit=10&sortBy=${sortBy}&sortOrder=${sortOrder}`;

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRoles(response.data.roles);
      setTotalPages(Math.ceil(response.data.roles.length / 10) || 1);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRoles();
    }
  }, [currentPage, sortBy, sortOrder, token]);

  useEffect(() => {
    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else if (token) {
      fetchRoles();
    }
  }, [searchTerm, token]);

  const handleDelete = async (id: number, name: string) => {
    // Don't allow deleting built-in roles
    if (["admin", "user", "moderator"].includes(name.toLowerCase())) {
      toast({
        title: "Cannot Delete",
        description: "Built-in roles cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    if (
      !window.confirm(`Are you sure you want to delete the role "${name}"?`)
    ) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Success",
        description: "Role deleted successfully",
      });

      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      toast({
        title: "Error",
        description: "Failed to delete role",
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
    fetchRoles();
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      navigate("/admin/roles/new");
    }
  };

  const handleEdit = (role: Role) => {
    if (onEdit) {
      onEdit(role);
    } else {
      navigate(`/admin/roles/edit/${role.id}`);
    }
  };

  const handleView = (role: Role) => {
    if (onView) {
      onView(role);
    } else {
      navigate(`/admin/roles/${role.id}`);
    }
  };

  const handleViewUsers = (roleId: number) => {
    navigate(`/admin/roles/${roleId}/users`);
  };

  const handleManagePermissions = (roleId: number) => {
    navigate(`/admin/roles/${roleId}/permissions`);
  };

  const isBuiltInRole = (name: string) => {
    return ["admin", "user", "moderator"].includes(name.toLowerCase());
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Roles</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" /> Create New Role
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search roles..."
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
              <TableHead>Permissions</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading roles...
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {role.description || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {role.permissionCount || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.userCount || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    {isBuiltInRole(role.name) ? (
                      <Badge>Built-in</Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
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
                        <DropdownMenuItem onClick={() => handleView(role)}>
                          <Shield className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleManagePermissions(role.id)}
                        >
                          <Shield className="mr-2 h-4 w-4" /> Manage Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewUsers(role.id)}
                        >
                          <Users className="mr-2 h-4 w-4" /> View Users
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEdit(role)}
                          disabled={isBuiltInRole(role.name)}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(role.id, role.name)}
                          className="text-red-600"
                          disabled={isBuiltInRole(role.name)}
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

export default RolesList;
