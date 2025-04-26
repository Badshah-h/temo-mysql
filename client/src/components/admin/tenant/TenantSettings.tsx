import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Save, Upload, Trash2, Globe, Key } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api/authApi";
import AdminLayout from "../AdminLayout";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const tenantSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
});

const advancedSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  domain: z.string().optional(),
  apiEnabled: z.boolean().optional(),
  welcomeMessage: z.string().optional(),
});

type TenantFormValues = z.infer<typeof tenantSchema>;
type AdvancedFormValues = z.infer<typeof advancedSchema>;

const TenantSettings: React.FC = () => {
  const { tenant, setCurrentTenant } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("branding");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: tenant?.name || "",
      primaryColor: tenant?.primaryColor || "#3b82f6",
      secondaryColor: tenant?.secondaryColor || "#10b981",
    },
  });

  const {
    register: registerAdvanced,
    handleSubmit: handleSubmitAdvanced,
    formState: { errors: advancedErrors },
    reset: resetAdvanced,
    setValue: setAdvancedValue,
    watch: watchAdvanced,
  } = useForm<AdvancedFormValues>({
    resolver: zodResolver(advancedSchema),
    defaultValues: {
      slug: tenant?.slug || "",
      domain: "",
      apiEnabled: false,
      welcomeMessage: "",
    },
  });

  // Update form when tenant changes
  useEffect(() => {
    if (tenant) {
      setValue("name", tenant.name);
      setValue("primaryColor", tenant.primaryColor || "#3b82f6");
      setValue("secondaryColor", tenant.secondaryColor || "#10b981");
      setLogoPreview(tenant.logoUrl || null);

      // Advanced settings
      setAdvancedValue("slug", tenant.slug);
      setAdvancedValue("domain", tenant.domain || "");
      setAdvancedValue("apiEnabled", tenant.apiEnabled || false);
      setAdvancedValue("welcomeMessage", tenant.welcomeMessage || "");
    }
  }, [tenant, setValue, setAdvancedValue]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const onSubmit = async (data: TenantFormValues) => {
    if (!tenant) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real implementation, you would upload the logo file to a storage service
      // and get back a URL. For this example, we'll just use the preview as if it were the URL.
      const logoUrl = logoPreview;

      const updatedTenant = await authApi.updateTenant(tenant.id, {
        name: data.name,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        logoUrl,
      });

      setCurrentTenant(updatedTenant.tenant);
      setSuccess("Organization settings updated successfully");
    } catch (err: any) {
      console.error("Failed to update tenant:", err);
      setError(
        err.response?.data?.message || "Failed to update organization settings",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitAdvanced = async (data: AdvancedFormValues) => {
    if (!tenant) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedTenant = await authApi.updateTenant(tenant.id, {
        slug: data.slug,
        domain: data.domain,
        apiEnabled: data.apiEnabled,
        welcomeMessage: data.welcomeMessage,
      });

      setCurrentTenant(updatedTenant.tenant);
      setSuccess("Advanced settings updated successfully");
    } catch (err: any) {
      console.error("Failed to update advanced settings:", err);
      setError(
        err.response?.data?.message || "Failed to update advanced settings",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError(null);
    setSuccess(null);
  };

  const apiEnabled = watchAdvanced("apiEnabled");

  return (
    <AdminLayout title="Organization Settings">
      <div className="max-w-4xl mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="branding" onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Organization Branding</CardTitle>
                <CardDescription>
                  Customize how your organization appears throughout the
                  application.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Organization Name
                      {errors.name && (
                        <span className="text-red-500 text-xs ml-1">
                          {errors.name.message}
                        </span>
                      )}
                    </Label>
                    <Input
                      id="name"
                      placeholder="Acme Inc."
                      {...register("name")}
                      aria-invalid={errors.name ? "true" : "false"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Organization Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded bg-slate-100 flex items-center justify-center overflow-hidden border">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo Preview"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-slate-400 text-xs text-center">
                            No Logo
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() =>
                              document.getElementById("logo-upload")?.click()
                            }
                          >
                            <Upload className="h-4 w-4" />
                            Upload Logo
                          </Button>
                          {logoPreview && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-red-500 hover:text-red-600"
                              onClick={handleRemoveLogo}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </Button>
                          )}
                        </div>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoChange}
                        />
                        <p className="text-xs text-slate-500">
                          Recommended size: 512x512px. Max 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">
                        Primary Color
                        {errors.primaryColor && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.primaryColor.message}
                          </span>
                        )}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="primaryColor-picker"
                          type="color"
                          className="w-10 h-10 p-1"
                          {...register("primaryColor")}
                        />
                        <Input
                          id="primaryColor"
                          type="text"
                          placeholder="#3b82f6"
                          className="flex-1"
                          {...register("primaryColor")}
                          aria-invalid={errors.primaryColor ? "true" : "false"}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">
                        Secondary Color
                        {errors.secondaryColor && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.secondaryColor.message}
                          </span>
                        )}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="secondaryColor-picker"
                          type="color"
                          className="w-10 h-10 p-1"
                          {...register("secondaryColor")}
                        />
                        <Input
                          id="secondaryColor"
                          type="text"
                          placeholder="#10b981"
                          className="flex-1"
                          {...register("secondaryColor")}
                          aria-invalid={
                            errors.secondaryColor ? "true" : "false"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
                    <h3 className="text-sm font-medium mb-2">Preview</h3>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: watch("primaryColor") }}
                      >
                        {watch("name").charAt(0)}
                      </div>
                      <div>
                        <p
                          className="font-medium"
                          style={{ color: watch("primaryColor") }}
                        >
                          {watch("name")}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: watch("primaryColor") }}
                          ></div>
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: watch("secondaryColor") }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end border-t pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Save Branding Settings"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure technical settings for your organization.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmitAdvanced(onSubmitAdvanced)}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      Organization Slug
                      {advancedErrors.slug && (
                        <span className="text-red-500 text-xs ml-1">
                          {advancedErrors.slug.message}
                        </span>
                      )}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="slug"
                        placeholder="acme-inc"
                        {...registerAdvanced("slug")}
                        aria-invalid={advancedErrors.slug ? "true" : "false"}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Used in URLs and API calls. Only lowercase letters,
                      numbers, and hyphens.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domain">
                      Custom Domain (Optional)
                      {advancedErrors.domain && (
                        <span className="text-red-500 text-xs ml-1">
                          {advancedErrors.domain.message}
                        </span>
                      )}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-400" />
                      <Input
                        id="domain"
                        placeholder="widget.yourdomain.com"
                        {...registerAdvanced("domain")}
                        aria-invalid={advancedErrors.domain ? "true" : "false"}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      If set, your widget will be accessible from this domain.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="apiEnabled" className="mb-1 block">
                          API Access
                        </Label>
                        <p className="text-xs text-slate-500">
                          Enable API access for this organization
                        </p>
                      </div>
                      <Switch
                        id="apiEnabled"
                        {...registerAdvanced("apiEnabled")}
                      />
                    </div>
                  </div>

                  {apiEnabled && (
                    <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">API Key</h3>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Key className="h-3 w-3 mr-1" /> Generate New Key
                        </Button>
                      </div>
                      <div className="bg-slate-100 p-2 rounded font-mono text-xs break-all">
                        {tenant?.apiKey || "No API key generated yet"}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Keep this key secret. You can regenerate it at any time,
                        but this will invalidate the old key.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="welcomeMessage">
                      Welcome Message
                      {advancedErrors.welcomeMessage && (
                        <span className="text-red-500 text-xs ml-1">
                          {advancedErrors.welcomeMessage.message}
                        </span>
                      )}
                    </Label>
                    <Textarea
                      id="welcomeMessage"
                      placeholder="Welcome to our chat! How can we help you today?"
                      className="min-h-[100px]"
                      {...registerAdvanced("welcomeMessage")}
                    />
                    <p className="text-xs text-slate-500">
                      This message will be shown when a user first opens the
                      chat widget.
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end border-t pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Save Advanced Settings"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default TenantSettings;
