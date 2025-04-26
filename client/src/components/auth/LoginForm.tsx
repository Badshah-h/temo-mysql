import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Building } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AuthLayout from "./AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api/authApi";
import { Tenant } from "@/types/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  tenantSlug: z.string().min(1, "Please select a tenant"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);

  // Get the redirect path from location state or default to '/admin'
  const from = location.state?.from?.pathname || "/admin";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    control,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      tenantSlug: "default", // Default tenant
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

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      const response = await authApi.login(
        data.email,
        data.password,
        data.tenantSlug,
      );

      // Store the token and user data in auth context
      login(response.token, response.user, response.tenant);

      // Redirect to the page they tried to visit or default
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (
        err.response?.status === 404 &&
        err.response?.data?.message === "Tenant not found"
      ) {
        setError("Selected organization not found. Please choose another.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred. Please try again.");
      }
      console.error("Login error:", err);
    }
  };

  const selectedTenantSlug = watch("tenantSlug");

  return (
    <AuthLayout
      title="Admin Login"
      subtitle="Enter your credentials to access the admin dashboard"
      features={[
        "Manage context rules and templates",
        "Configure widget appearance",
        "Secure admin access",
      ]}
    >
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="tenantSlug">
            Organization
            {errors.tenantSlug && (
              <span className="text-red-500 text-xs ml-1">
                {errors.tenantSlug.message}
              </span>
            )}
          </Label>
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
              placeholder="admin@example.com"
              className="pl-10 bg-slate-50"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">
              Password
              {errors.password && (
                <span className="text-red-500 text-xs ml-1">
                  {errors.password.message}
                </span>
              )}
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
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
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>

        <div className="text-center text-sm">
          <span className="text-slate-500">Don't have an account? </span>
          <Link to="/register" className="text-primary hover:underline">
            Register here
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginForm;

export default LoginForm;
