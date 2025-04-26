import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Check,
  ChevronDown,
  Code,
  Eye,
  Palette,
  Settings,
  Sliders,
  Type,
  Save,
  Undo,
  Smartphone,
  Monitor,
  Tablet,
  AlertCircle,
} from "lucide-react";
import EmbedCodeGenerator from "./EmbedCodeGenerator";
import { Alert, AlertDescription } from "./ui/alert";
import { widgetPresets } from "./widget/WidgetPresetData";
import WidgetPresets from "./widget/WidgetPresets";
import WidgetPreview from "./widget/WidgetPreview";
import WidgetConfigForm from "./widget/WidgetConfigForm";

export interface WidgetConfig {
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    backgroundColor: string;
    borderRadius: number;
    fontFamily: string;
    position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    theme: "light" | "dark" | "system";
    buttonStyle: "rounded" | "square" | "soft";
    size: "small" | "medium" | "large";
  };
  behavior: {
    autoOpen: boolean;
    autoOpenDelay: number;
    showNotifications: boolean;
    enableSound: boolean;
    enableAnimation: boolean;
    mobileOptimized: boolean;
  };
  content: {
    welcomeMessage: string;
    botName: string;
    botAvatar: string;
    inputPlaceholder: string;
    offlineMessage: string;
  };
  advanced: {
    dataCollection: boolean;
    analyticsEnabled: boolean;
    rateLimit: number;
    requireAuthentication: boolean;
  };
}

const defaultConfig: WidgetConfig = {
  appearance: {
    primaryColor: "#7C3AED",
    secondaryColor: "#4F46E5",
    textColor: "#1F2937",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    fontFamily: "Inter",
    position: "bottom-right",
    theme: "light",
    buttonStyle: "rounded",
    size: "medium",
  },
  behavior: {
    autoOpen: false,
    autoOpenDelay: 5,
    showNotifications: true,
    enableSound: false,
    enableAnimation: true,
    mobileOptimized: true,
  },
  content: {
    welcomeMessage: "Hello! How can I help you today?",
    botName: "AI Assistant",
    botAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=assistant",
    inputPlaceholder: "Type your message here...",
    offlineMessage:
      "We're currently offline. Please leave a message and we'll get back to you soon.",
  },
  advanced: {
    dataCollection: true,
    analyticsEnabled: true,
    rateLimit: 10,
    requireAuthentication: false,
  },
};

interface WidgetConfiguratorProps {
  initialConfig?: WidgetConfig;
  onSave?: (config: WidgetConfig) => void;
  widgetId?: string;
}

const WidgetConfigurator: React.FC<WidgetConfiguratorProps> = ({
  initialConfig = defaultConfig,
  onSave,
  widgetId = "widget-" + Math.random().toString(36).substring(2, 9),
}) => {
  const [config, setConfig] = useState<WidgetConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState("appearance");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<
    "desktop" | "mobile" | "tablet"
  >("desktop");
  const [showPresets, setShowPresets] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Track if there are unsaved changes
    setUnsavedChanges(JSON.stringify(config) !== JSON.stringify(initialConfig));
  }, [config, initialConfig]);

  const updateConfig = (
    section: keyof WidgetConfig,
    key: string,
    value: any,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSelectPreset = (preset: any) => {
    setConfig(preset.config);
    setSelectedPreset(preset.id);
  };

  const handleSaveConfig = () => {
    if (onSave) {
      onSave(config);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    setUnsavedChanges(false);
  };

  const handleResetConfig = () => {
    setConfig(initialConfig);
    setSelectedPreset(null);
    setUnsavedChanges(false);
  };

  return (
    <div className="bg-background w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8 rounded-lg">
      {showPresets ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Choose a Template</h2>
              <p className="text-muted-foreground">
                Select a pre-designed template as a starting point for your chat
                widget
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowPresets(false)}>
              Back to Editor
            </Button>
          </div>
          <WidgetPresets
            presets={widgetPresets}
            selectedPreset={selectedPreset}
            onSelectPreset={handleSelectPreset}
          />
          <div className="flex justify-end">
            <Button onClick={() => setShowPresets(false)}>
              Continue with Selected Template
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-3/5">
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Widget Configurator</CardTitle>
                    <CardDescription>
                      Customize your chat widget's appearance, behavior,
                      content, and advanced settings.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPresets(true)}
                    >
                      Templates
                    </Button>
                    {unsavedChanges && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetConfig}
                      >
                        <Undo className="h-4 w-4 mr-1" /> Reset
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={handleSaveConfig}
                      disabled={!unsavedChanges}
                    >
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                </div>
                {saveSuccess && (
                  <Alert className="mt-2 bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700">
                      Configuration saved successfully!
                    </AlertDescription>
                  </Alert>
                )}
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger
                      value="appearance"
                      className="flex items-center gap-2"
                    >
                      <Palette className="h-4 w-4" />
                      <span className="hidden sm:inline">Appearance</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="behavior"
                      className="flex items-center gap-2"
                    >
                      <Sliders className="h-4 w-4" />
                      <span className="hidden sm:inline">Behavior</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="content"
                      className="flex items-center gap-2"
                    >
                      <Type className="h-4 w-4" />
                      <span className="hidden sm:inline">Content</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="advanced"
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Advanced</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="appearance" className="space-y-6">
                    <WidgetConfigForm
                      config={config}
                      section="appearance"
                      updateConfig={updateConfig}
                    />
                  </TabsContent>

                  <TabsContent value="behavior" className="space-y-6">
                    <WidgetConfigForm
                      config={config}
                      section="behavior"
                      updateConfig={updateConfig}
                    />
                  </TabsContent>

                  <TabsContent value="content" className="space-y-6">
                    <WidgetConfigForm
                      config={config}
                      section="content"
                      updateConfig={updateConfig}
                    />
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-6">
                    <WidgetConfigForm
                      config={config}
                      section="advanced"
                      updateConfig={updateConfig}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button
                  variant="outline"
                  onClick={handleResetConfig}
                  disabled={!unsavedChanges}
                >
                  Reset to Defaults
                </Button>
                <Button onClick={handleSaveConfig} disabled={!unsavedChanges}>
                  <Save className="h-4 w-4 mr-2" /> Save Configuration
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-8">
              <EmbedCodeGenerator widgetId={widgetId} widgetConfig={config} />
            </div>
          </div>

          <div className="w-full lg:w-2/5">
            <div className="sticky top-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium">Live Preview</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <Button
                      variant={previewMode === "desktop" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setPreviewMode("desktop")}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === "tablet" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setPreviewMode("tablet")}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === "mobile" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setPreviewMode("mobile")}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Palette className="h-4 w-4" />
                        <span>Theme</span>
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56">
                      <div className="space-y-2">
                        <h4 className="font-medium">Select Theme</h4>
                        <Separator />
                        <div className="space-y-1">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() =>
                              updateConfig("appearance", "theme", "light")
                            }
                          >
                            {config.appearance.theme === "light" && (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            Light
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() =>
                              updateConfig("appearance", "theme", "dark")
                            }
                          >
                            {config.appearance.theme === "dark" && (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            Dark
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() =>
                              updateConfig("appearance", "theme", "system")
                            }
                          >
                            {config.appearance.theme === "system" && (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            System
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="bg-slate-100 rounded-lg p-4 h-[600px] flex items-center justify-center border">
                <div className="relative w-full h-full max-w-[380px] max-h-[600px] mx-auto overflow-auto">
                  <WidgetPreview config={config} previewMode={previewMode} />
                </div>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                <p className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  This is a preview of how your widget will appear to users.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetConfigurator;
