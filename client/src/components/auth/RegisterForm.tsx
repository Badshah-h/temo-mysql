import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Building,
  Plus,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AuthLayout from "./AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api/authApi";
import { Tenant } from "@/types/auth";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    tenantSlug: z.string().min(1, "Please select an organization"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const newTenantSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type NewTenantFormValues = z.infer<typeof newTenantSchema>;

const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [newTenantDialogOpen, setNewTenantDialogOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    control,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      tenantSlug: "default",
    },
  });

  const {
    register: registerTenant,
    handleSubmit: handleSubmitTenant,
    formState: { errors: tenantErrors, isSubmitting: isTenantSubmitting },
    reset: resetTenantForm,
  } = useForm<NewTenantFormValues>({
    resolver: zodResolver(newTenantSchema),
    defaultValues: {
      name: "",
      slug: "",
      primaryColor: "#4f46e5",
      secondaryColor: "#10b981",
    },
  });

  // Fetch tenants on mount
  useEffect(() => {
    const fetchTenants = async () => {
      setTenantsLoading(true);
      try {
        const data = await authApi.getTenants();
        const tenantsList = data.tenants || data; // support both {tenants: []} and []
        setTenants(tenantsList);

        // Ensure default tenant is in the list
        const hasDefaultTenant = tenantsList.some((t) => t.slug === "default");
        if (!hasDefaultTenant && tenantsList.length > 0) {
          setValue("tenantSlug", tenantsList[0].slug);
        }
      } catch (err) {
        console.error("Failed to load tenants:", err);
        // Create a default tenant in the list even if API fails
        setTenants([
          {
            id: 0,
            name: "Default Tenant",
            slug: "default",
          },
        ]);
      } finally {
        setTenantsLoading(false);
      }
    };
    fetchTenants();
  }, [setValue]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError(null);
      const response = await authApi.register(
        data.fullName,
        data.email,
        data.password,
        data.tenantSlug,
      );

      // Store the token and user data in auth context
      login(response.token, response.user, response.tenant);

      // Redirect to admin dashboard
      navigate("/admin", { replace: true });
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Email already in use. Please try another email.");
      } else if (
        err.response?.status === 404 &&
        err.response?.data?.message === "Tenant not found"
      ) {
        setError(
          "Selected organization not found. Please choose another or create a new one.",
        );
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Registration failed. Please try again or contact support if the issue persists.",
        );
      }
      console.error("Registration error:", err);
    }
  };

  const onCreateTenant = async (data: NewTenantFormValues) => {
    try {
      const response = await authApi.createTenant({
        name: data.name,
        slug: data.slug,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
      });

      // Add the new tenant to the list
      setTenants([...tenants, response.tenant]);

      // Select the new tenant
      setValue("tenantSlug", response.tenant.slug);

      // Close the dialog
      setNewTenantDialogOpen(false);

      // Reset the form
      resetTenantForm();

      // Switch to existing tab
      setActiveTab("existing");
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Organization slug already in use. Please try another.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to create organization. Please try again.");
      }
      console.error("Create tenant error:", err);
    }
  };

  const selectedTenantSlug = watch("tenantSlug");

  return (
    <AuthLayout
      title="Create an Admin Account"
      subtitle="Enter your details to register as an admin for ChatEmbed"
    >
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Full Name
            {errors.fullName && (
              <span className="text-red-500 text-xs ml-1">
                {errors.fullName.message}
              </span>
            )}
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              className="pl-10 bg-slate-50"
              {...register("fullName")}
              aria-invalid={errors.fullName ? "true" : "false"}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email
            {errors.email && (
              <span className="text-red-500 text-xs ml-1">
                {errors.email.message}
              </span>
            )}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              className="pl-10 bg-slate-50"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Organization
            {errors.tenantSlug && (
              <span className="text-red-500 text-xs ml-1">
                {errors.tenantSlug.message}
              </span>
            )}
          </Label>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "existing" | "new")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Existing Organization</TabsTrigger>
              <TabsTrigger value="new">Create New</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="pt-4">
              {tenantsLoading ? (
                <div className="p-2 bg-slate-100 rounded text-slate-500 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                  <span>Loading organizations...</span>
                </div>
              ) : (
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                  <Select
                    value={selectedTenantSlug}
                    onValueChange={(value) => setValue("tenantSlug", value)}
                  >
                    <SelectTrigger className="pl-10 bg-slate-50">
                      <SelectValue placeholder="Select an organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.slug} value={tenant.slug}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    type="hidden"
                    {...register("tenantSlug")}
                    value={selectedTenantSlug}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="new" className="pt-4">
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                <p className="text-sm mb-4">
                  Create a new organization for your chat widget:
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={() => setNewTenantDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create New Organization
                </Button>
              </div>

              <Dialog
                open={newTenantDialogOpen}
                onOpenChange={setNewTenantDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Organization</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new organization for your
                      chat widget.
                    </DialogDescription>
                  </DialogHeader>

                  <form
                    onSubmit={handleSubmitTenant(onCreateTenant)}
                    className="space-y-4 py-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Organization Name
                        {tenantErrors.name && (
                          <span className="text-red-500 text-xs ml-1">
                            {tenantErrors.name.message}
                          </span>
                        )}
                      </Label>
                      <Input
                        id="name"
                        placeholder="Acme Inc."
                        {...registerTenant("name")}
                        aria-invalid={tenantErrors.name ? "true" : "false"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">
                        Organization Slug
                        {tenantErrors.slug && (
                          <span className="text-red-500 text-xs ml-1">
                            {tenantErrors.slug.message}
                          </span>
                        )}
                      </Label>
                      <Input
                        id="slug"
                        placeholder="acme-inc"
                        {...registerTenant("slug")}
                        aria-invalid={tenantErrors.slug ? "true" : "false"}
                      />
                      <p className="text-xs text-slate-500">
                        Used in URLs and API calls. Only lowercase letters,
                        numbers, and hyphens.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">
                          Primary Color
                          {tenantErrors.primaryColor && (
                            <span className="text-red-500 text-xs ml-1">
                              {tenantErrors.primaryColor.message}
                            </span>
                          )}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="primaryColor"
                            type="color"
                            className="w-10 h-10 p-1"
                            {...registerTenant("primaryColor")}
                          />
                          <Input
                            type="text"
                            placeholder="#4f46e5"
                            className="flex-1"
                            {...registerTenant("primaryColor")}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="secondaryColor">
                          Secondary Color
                          {tenantErrors.secondaryColor && (
                            <span className="text-red-500 text-xs ml-1">
                              {tenantErrors.secondaryColor.message}
                            </span>
                          )}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="secondaryColor"
                            type="color"
                            className="w-10 h-10 p-1"
                            {...registerTenant("secondaryColor")}
                          />
                          <Input
                            type="text"
                            placeholder="#10b981"
                            className="flex-1"
                            {...registerTenant("secondaryColor")}
                          />
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setNewTenantDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isTenantSubmitting}>
                        {isTenantSubmitting
                          ? "Creating..."
                          : "Create Organization"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            Password
            {errors.password && (
              <span className="text-red-500 text-xs ml-1">
                {errors.password.message}
              </span>
            )}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 bg-slate-50"
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Must be at least 8 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirm Password
            {errors.confirmPassword && (
              <span className="text-red-500 text-xs ml-1">
                {errors.confirmPassword.message}
              </span>
            )}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 bg-slate-50"
              {...register("confirmPassword")}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </Button>

        <div className="text-center text-sm">
          <span className="text-slate-500">Already have an account? </span>
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>

        <p className="text-xs text-center text-slate-500">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterForm;

export default RegisterForm;
