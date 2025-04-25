import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthLayout from "./AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api/authApi";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError(null);
      const response = await authApi.register(
        data.fullName,
        data.email,
        data.password,
      );

      // Store the token and user data in auth context
      login(response.token, response.user);

      // Redirect to admin dashboard
      navigate("/admin", { replace: true });
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Email already in use. Please try another email.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred. Please try again.");
      }
      console.error("Registration error:", err);
    }
  };

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
