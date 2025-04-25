import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
} from "lucide-react";
import EmbedCodeGenerator from "./EmbedCodeGenerator";

interface WidgetConfiguratorProps {
  initialConfig?: WidgetConfig;
}

interface WidgetConfig {
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

// Mock ChatWidget component for preview
const ChatWidgetPreview: React.FC<{ config: WidgetConfig }> = ({ config }) => {
  return (
    <div
      className="w-full h-full rounded-lg overflow-hidden flex flex-col"
      style={{
        backgroundColor: config.appearance.backgroundColor,
        borderRadius: `${config.appearance.borderRadius}px`,
        fontFamily: config.appearance.fontFamily,
      }}
    >
      {/* Widget Header */}
      <div
        className="p-4 flex items-center gap-3"
        style={{
          backgroundColor: config.appearance.primaryColor,
          color: "#FFFFFF",
        }}
      >
        <img
          src={config.content.botAvatar}
          alt={config.content.botName}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div>
          <h3 className="font-medium">{config.content.botName}</h3>
          <p className="text-xs opacity-80">Online</p>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* System Message */}
        <div className="flex items-start gap-2">
          <img
            src={config.content.botAvatar}
            alt={config.content.botName}
            className="w-6 h-6 rounded-full mt-1"
          />
          <div
            className="rounded-lg p-3 max-w-[80%]"
            style={{
              backgroundColor: `${config.appearance.primaryColor}20`,
              color: config.appearance.textColor,
            }}
          >
            {config.content.welcomeMessage}
          </div>
        </div>

        {/* User Message Example */}
        <div className="flex items-start gap-2 flex-row-reverse">
          <div className="w-6 h-6 rounded-full mt-1 bg-gray-300 flex items-center justify-center">
            <span className="text-xs">U</span>
          </div>
          <div
            className="rounded-lg p-3 max-w-[80%]"
            style={{
              backgroundColor: config.appearance.primaryColor,
              color: "#FFFFFF",
            }}
          >
            Hello! I have a question about your services.
          </div>
        </div>

        {/* Bot Response */}
        <div className="flex items-start gap-2">
          <img
            src={config.content.botAvatar}
            alt={config.content.botName}
            className="w-6 h-6 rounded-full mt-1"
          />
          <div
            className="rounded-lg p-3 max-w-[80%]"
            style={{
              backgroundColor: `${config.appearance.primaryColor}20`,
              color: config.appearance.textColor,
            }}
          >
            I'd be happy to help! What would you like to know about our
            services?
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div
        className="p-3 border-t"
        style={{ borderColor: `${config.appearance.textColor}20` }}
      >
        <div className="flex items-center gap-2">
          <Input
            placeholder={config.content.inputPlaceholder}
            className="flex-1"
            style={{
              backgroundColor: `${config.appearance.textColor}10`,
              color: config.appearance.textColor,
            }}
          />
          <Button
            size="sm"
            style={{
              backgroundColor: config.appearance.primaryColor,
              color: "#FFFFFF",
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

const WidgetConfigurator: React.FC<WidgetConfiguratorProps> = ({
  initialConfig = defaultConfig,
}) => {
  const [config, setConfig] = useState<WidgetConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState("appearance");

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

  const fontOptions = [
    { value: "Inter", label: "Inter" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Poppins", label: "Poppins" },
  ];

  const positionOptions = [
    { value: "bottom-right", label: "Bottom Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "top-right", label: "Top Right" },
    { value: "top-left", label: "Top Left" },
  ];

  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  const buttonStyleOptions = [
    { value: "rounded", label: "Rounded" },
    { value: "square", label: "Square" },
    { value: "soft", label: "Soft" },
  ];

  const sizeOptions = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  return (
    <div className="bg-background w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8 rounded-lg">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-3/5">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Widget Configurator</CardTitle>
              <CardDescription>
                Customize your chat widget's appearance, behavior, content, and
                advanced settings.
              </CardDescription>
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

                {/* Appearance Tab */}
                <TabsContent value="appearance" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-8 h-8 rounded-md border"
                            style={{
                              backgroundColor: config.appearance.primaryColor,
                            }}
                          />
                          <Input
                            id="primaryColor"
                            type="text"
                            value={config.appearance.primaryColor}
                            onChange={(e) =>
                              updateConfig(
                                "appearance",
                                "primaryColor",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-8 h-8 rounded-md border"
                            style={{
                              backgroundColor: config.appearance.secondaryColor,
                            }}
                          />
                          <Input
                            id="secondaryColor"
                            type="text"
                            value={config.appearance.secondaryColor}
                            onChange={(e) =>
                              updateConfig(
                                "appearance",
                                "secondaryColor",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="textColor">Text Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-8 h-8 rounded-md border"
                            style={{
                              backgroundColor: config.appearance.textColor,
                            }}
                          />
                          <Input
                            id="textColor"
                            type="text"
                            value={config.appearance.textColor}
                            onChange={(e) =>
                              updateConfig(
                                "appearance",
                                "textColor",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="backgroundColor">
                          Background Color
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-8 h-8 rounded-md border"
                            style={{
                              backgroundColor:
                                config.appearance.backgroundColor,
                            }}
                          />
                          <Input
                            id="backgroundColor"
                            type="text"
                            value={config.appearance.backgroundColor}
                            onChange={(e) =>
                              updateConfig(
                                "appearance",
                                "backgroundColor",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="borderRadius">Border Radius</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            id="borderRadius"
                            min={0}
                            max={24}
                            step={1}
                            value={[config.appearance.borderRadius]}
                            onValueChange={(value) =>
                              updateConfig(
                                "appearance",
                                "borderRadius",
                                value[0],
                              )
                            }
                            className="flex-1"
                          />
                          <span className="w-8 text-center">
                            {config.appearance.borderRadius}px
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="fontFamily">Font Family</Label>
                        <Select
                          value={config.appearance.fontFamily}
                          onValueChange={(value) =>
                            updateConfig("appearance", "fontFamily", value)
                          }
                        >
                          <SelectTrigger id="fontFamily" className="mt-1">
                            <SelectValue placeholder="Select font" />
                          </SelectTrigger>
                          <SelectContent>
                            {fontOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="position">Widget Position</Label>
                        <Select
                          value={config.appearance.position}
                          onValueChange={(value: any) =>
                            updateConfig("appearance", "position", value)
                          }
                        >
                          <SelectTrigger id="position" className="mt-1">
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            {positionOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="theme">Theme</Label>
                        <Select
                          value={config.appearance.theme}
                          onValueChange={(value: any) =>
                            updateConfig("appearance", "theme", value)
                          }
                        >
                          <SelectTrigger id="theme" className="mt-1">
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            {themeOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="buttonStyle">Button Style</Label>
                          <Select
                            value={config.appearance.buttonStyle}
                            onValueChange={(value: any) =>
                              updateConfig("appearance", "buttonStyle", value)
                            }
                          >
                            <SelectTrigger id="buttonStyle" className="mt-1">
                              <SelectValue placeholder="Select style" />
                            </SelectTrigger>
                            <SelectContent>
                              {buttonStyleOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="size">Widget Size</Label>
                          <Select
                            value={config.appearance.size}
                            onValueChange={(value: any) =>
                              updateConfig("appearance", "size", value)
                            }
                          >
                            <SelectTrigger id="size" className="mt-1">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {sizeOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Behavior Tab */}
                <TabsContent value="behavior" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="autoOpen">Auto Open Widget</Label>
                        <Switch
                          id="autoOpen"
                          checked={config.behavior.autoOpen}
                          onCheckedChange={(checked) =>
                            updateConfig("behavior", "autoOpen", checked)
                          }
                        />
                      </div>

                      {config.behavior.autoOpen && (
                        <div>
                          <Label htmlFor="autoOpenDelay">
                            Auto Open Delay (seconds)
                          </Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Slider
                              id="autoOpenDelay"
                              min={0}
                              max={30}
                              step={1}
                              value={[config.behavior.autoOpenDelay]}
                              onValueChange={(value) =>
                                updateConfig(
                                  "behavior",
                                  "autoOpenDelay",
                                  value[0],
                                )
                              }
                              className="flex-1"
                            />
                            <span className="w-8 text-center">
                              {config.behavior.autoOpenDelay}s
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <Label htmlFor="showNotifications">
                          Show Notifications
                        </Label>
                        <Switch
                          id="showNotifications"
                          checked={config.behavior.showNotifications}
                          onCheckedChange={(checked) =>
                            updateConfig(
                              "behavior",
                              "showNotifications",
                              checked,
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableSound">
                          Enable Sound Effects
                        </Label>
                        <Switch
                          id="enableSound"
                          checked={config.behavior.enableSound}
                          onCheckedChange={(checked) =>
                            updateConfig("behavior", "enableSound", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableAnimation">
                          Enable Animations
                        </Label>
                        <Switch
                          id="enableAnimation"
                          checked={config.behavior.enableAnimation}
                          onCheckedChange={(checked) =>
                            updateConfig("behavior", "enableAnimation", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="mobileOptimized">
                          Mobile Optimized
                        </Label>
                        <Switch
                          id="mobileOptimized"
                          checked={config.behavior.mobileOptimized}
                          onCheckedChange={(checked) =>
                            updateConfig("behavior", "mobileOptimized", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <Label htmlFor="welcomeMessage">Welcome Message</Label>
                      <Input
                        id="welcomeMessage"
                        className="mt-1"
                        value={config.content.welcomeMessage}
                        onChange={(e) =>
                          updateConfig(
                            "content",
                            "welcomeMessage",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="botName">Bot Name</Label>
                        <Input
                          id="botName"
                          className="mt-1"
                          value={config.content.botName}
                          onChange={(e) =>
                            updateConfig("content", "botName", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="botAvatar">Bot Avatar URL</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <img
                            src={config.content.botAvatar}
                            alt="Bot Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <Input
                            id="botAvatar"
                            value={config.content.botAvatar}
                            onChange={(e) =>
                              updateConfig(
                                "content",
                                "botAvatar",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="inputPlaceholder">
                        Input Placeholder
                      </Label>
                      <Input
                        id="inputPlaceholder"
                        className="mt-1"
                        value={config.content.inputPlaceholder}
                        onChange={(e) =>
                          updateConfig(
                            "content",
                            "inputPlaceholder",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="offlineMessage">Offline Message</Label>
                      <Input
                        id="offlineMessage"
                        className="mt-1"
                        value={config.content.offlineMessage}
                        onChange={(e) =>
                          updateConfig(
                            "content",
                            "offlineMessage",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="dataCollection">Data Collection</Label>
                        <Switch
                          id="dataCollection"
                          checked={config.advanced.dataCollection}
                          onCheckedChange={(checked) =>
                            updateConfig("advanced", "dataCollection", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="analyticsEnabled">
                          Analytics Enabled
                        </Label>
                        <Switch
                          id="analyticsEnabled"
                          checked={config.advanced.analyticsEnabled}
                          onCheckedChange={(checked) =>
                            updateConfig(
                              "advanced",
                              "analyticsEnabled",
                              checked,
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rateLimit">
                          Rate Limit (messages per minute)
                        </Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            id="rateLimit"
                            min={1}
                            max={30}
                            step={1}
                            value={[config.advanced.rateLimit]}
                            onValueChange={(value) =>
                              updateConfig("advanced", "rateLimit", value[0])
                            }
                            className="flex-1"
                          />
                          <span className="w-8 text-center">
                            {config.advanced.rateLimit}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="requireAuthentication">
                          Require Authentication
                        </Label>
                        <Switch
                          id="requireAuthentication"
                          checked={config.advanced.requireAuthentication}
                          onCheckedChange={(checked) =>
                            updateConfig(
                              "advanced",
                              "requireAuthentication",
                              checked,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Configuration</Button>
            </CardFooter>
          </Card>

          <div className="mt-8">
            <EmbedCodeGenerator config={config} />
          </div>
        </div>

        <div className="w-full lg:w-2/5">
          <div className="sticky top-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Live Preview</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </Button>
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
                        {themeOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() =>
                              updateConfig("appearance", "theme", option.value)
                            }
                          >
                            {config.appearance.theme === option.value && (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="bg-slate-100 rounded-lg p-4 h-[600px] flex items-center justify-center border">
              <div className="relative w-full h-full max-w-[380px] max-h-[600px] mx-auto">
                <ChatWidgetPreview config={config} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetConfigurator;
