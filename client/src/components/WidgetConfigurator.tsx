import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ChatWidget from "./ChatWidget";

interface AppearanceConfig {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  borderRadius: number;
  fontFamily: string;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme: "light" | "dark";
  buttonStyle: "rounded" | "square" | "soft";
  size: "small" | "medium" | "large";
}

interface BehaviorConfig {
  autoOpen: boolean;
  autoOpenDelay: number;
  showNotifications: boolean;
  enableSound: boolean;
  enableAnimation: boolean;
  mobileOptimized: boolean;
}

interface ContentConfig {
  welcomeMessage: string;
  botName: string;
  botAvatar: string;
  inputPlaceholder: string;
  offlineMessage: string;
}

interface AdvancedConfig {
  dataCollection: boolean;
  analyticsEnabled: boolean;
  rateLimit: number;
  requireAuthentication: boolean;
}

interface WidgetConfig {
  appearance: AppearanceConfig;
  behavior: BehaviorConfig;
  content: ContentConfig;
  advanced: AdvancedConfig;
}

interface WidgetConfiguratorProps {
  initialConfig?: WidgetConfig;
}

const defaultConfig: WidgetConfig = {
  appearance: {
    primaryColor: "#4f46e5",
    secondaryColor: "#818cf8",
    textColor: "#1f2937",
    backgroundColor: "#ffffff",
    borderRadius: 8,
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

const WidgetConfigurator: React.FC<WidgetConfiguratorProps> = ({
  initialConfig = defaultConfig,
}) => {
  const [config, setConfig] = useState<WidgetConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState("appearance");

  const updateAppearance = (key: keyof AppearanceConfig, value: any) => {
    setConfig({
      ...config,
      appearance: {
        ...config.appearance,
        [key]: value,
      },
    });
  };

  const updateBehavior = (key: keyof BehaviorConfig, value: any) => {
    setConfig({
      ...config,
      behavior: {
        ...config.behavior,
        [key]: value,
      },
    });
  };

  const updateContent = (key: keyof ContentConfig, value: any) => {
    setConfig({
      ...config,
      content: {
        ...config.content,
        [key]: value,
      },
    });
  };

  const updateAdvanced = (key: keyof AdvancedConfig, value: any) => {
    setConfig({
      ...config,
      advanced: {
        ...config.advanced,
        [key]: value,
      },
    });
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={config.appearance.primaryColor}
                        onChange={(e) =>
                          updateAppearance("primaryColor", e.target.value)
                        }
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={config.appearance.primaryColor}
                        onChange={(e) =>
                          updateAppearance("primaryColor", e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={config.appearance.secondaryColor}
                        onChange={(e) =>
                          updateAppearance("secondaryColor", e.target.value)
                        }
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={config.appearance.secondaryColor}
                        onChange={(e) =>
                          updateAppearance("secondaryColor", e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={config.appearance.textColor}
                        onChange={(e) =>
                          updateAppearance("textColor", e.target.value)
                        }
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={config.appearance.textColor}
                        onChange={(e) =>
                          updateAppearance("textColor", e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={config.appearance.backgroundColor}
                        onChange={(e) =>
                          updateAppearance("backgroundColor", e.target.value)
                        }
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={config.appearance.backgroundColor}
                        onChange={(e) =>
                          updateAppearance("backgroundColor", e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderRadius">
                    Border Radius: {config.appearance.borderRadius}px
                  </Label>
                  <Slider
                    id="borderRadius"
                    min={0}
                    max={20}
                    step={1}
                    value={[config.appearance.borderRadius]}
                    onValueChange={(value) =>
                      updateAppearance("borderRadius", value[0])
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select
                      value={config.appearance.fontFamily}
                      onValueChange={(value) =>
                        updateAppearance("fontFamily", value)
                      }
                    >
                      <SelectTrigger id="fontFamily">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Select
                      value={config.appearance.position}
                      onValueChange={(value: any) =>
                        updateAppearance("position", value)
                      }
                    >
                      <SelectTrigger id="position">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">
                          Bottom Right
                        </SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="top-left">Top Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={config.appearance.theme}
                      onValueChange={(value: any) =>
                        updateAppearance("theme", value)
                      }
                    >
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buttonStyle">Button Style</Label>
                    <Select
                      value={config.appearance.buttonStyle}
                      onValueChange={(value: any) =>
                        updateAppearance("buttonStyle", value)
                      }
                    >
                      <SelectTrigger id="buttonStyle">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rounded">Rounded</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="soft">Soft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoOpen">Auto Open</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically open the chat widget when page loads
                    </p>
                  </div>
                  <Switch
                    id="autoOpen"
                    checked={config.behavior.autoOpen}
                    onCheckedChange={(checked) =>
                      updateBehavior("autoOpen", checked)
                    }
                  />
                </div>

                {config.behavior.autoOpen && (
                  <div className="space-y-2">
                    <Label htmlFor="autoOpenDelay">
                      Auto Open Delay: {config.behavior.autoOpenDelay} seconds
                    </Label>
                    <Slider
                      id="autoOpenDelay"
                      min={0}
                      max={30}
                      step={1}
                      value={[config.behavior.autoOpenDelay]}
                      onValueChange={(value) =>
                        updateBehavior("autoOpenDelay", value[0])
                      }
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showNotifications">
                      Show Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display notification badges for new messages
                    </p>
                  </div>
                  <Switch
                    id="showNotifications"
                    checked={config.behavior.showNotifications}
                    onCheckedChange={(checked) =>
                      updateBehavior("showNotifications", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableSound">Enable Sound</Label>
                    <p className="text-sm text-muted-foreground">
                      Play sound when new messages arrive
                    </p>
                  </div>
                  <Switch
                    id="enableSound"
                    checked={config.behavior.enableSound}
                    onCheckedChange={(checked) =>
                      updateBehavior("enableSound", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableAnimation">Enable Animation</Label>
                    <p className="text-sm text-muted-foreground">
                      Use animations for widget transitions
                    </p>
                  </div>
                  <Switch
                    id="enableAnimation"
                    checked={config.behavior.enableAnimation}
                    onCheckedChange={(checked) =>
                      updateBehavior("enableAnimation", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="mobileOptimized">Mobile Optimized</Label>
                    <p className="text-sm text-muted-foreground">
                      Optimize widget for mobile devices
                    </p>
                  </div>
                  <Switch
                    id="mobileOptimized"
                    checked={config.behavior.mobileOptimized}
                    onCheckedChange={(checked) =>
                      updateBehavior("mobileOptimized", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Input
                    id="welcomeMessage"
                    value={config.content.welcomeMessage}
                    onChange={(e) =>
                      updateContent("welcomeMessage", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="botName">Bot Name</Label>
                  <Input
                    id="botName"
                    value={config.content.botName}
                    onChange={(e) => updateContent("botName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="botAvatar">Bot Avatar URL</Label>
                  <Input
                    id="botAvatar"
                    value={config.content.botAvatar}
                    onChange={(e) => updateContent("botAvatar", e.target.value)}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden border">
                      <img
                        src={config.content.botAvatar}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Avatar Preview
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inputPlaceholder">Input Placeholder</Label>
                  <Input
                    id="inputPlaceholder"
                    value={config.content.inputPlaceholder}
                    onChange={(e) =>
                      updateContent("inputPlaceholder", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offlineMessage">Offline Message</Label>
                  <Input
                    id="offlineMessage"
                    value={config.content.offlineMessage}
                    onChange={(e) =>
                      updateContent("offlineMessage", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dataCollection">Data Collection</Label>
                    <p className="text-sm text-muted-foreground">
                      Collect user data for analytics and improvement
                    </p>
                  </div>
                  <Switch
                    id="dataCollection"
                    checked={config.advanced.dataCollection}
                    onCheckedChange={(checked) =>
                      updateAdvanced("dataCollection", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analyticsEnabled">Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable usage analytics and reporting
                    </p>
                  </div>
                  <Switch
                    id="analyticsEnabled"
                    checked={config.advanced.analyticsEnabled}
                    onCheckedChange={(checked) =>
                      updateAdvanced("analyticsEnabled", checked)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rateLimit">
                    Rate Limit: {config.advanced.rateLimit} messages per minute
                  </Label>
                  <Slider
                    id="rateLimit"
                    min={1}
                    max={60}
                    step={1}
                    value={[config.advanced.rateLimit]}
                    onValueChange={(value) =>
                      updateAdvanced("rateLimit", value[0])
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireAuthentication">
                      Require Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Users must be authenticated to use the chat
                    </p>
                  </div>
                  <Switch
                    id="requireAuthentication"
                    checked={config.advanced.requireAuthentication}
                    onCheckedChange={(checked) =>
                      updateAdvanced("requireAuthentication", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={resetConfig}>
            Reset to Default
          </Button>
          <Button>Save Configuration</Button>
        </div>
      </div>

      <div className="bg-slate-100 p-6 rounded-lg flex flex-col items-center">
        <h3 className="text-lg font-medium mb-4">Preview</h3>
        <div className="relative w-full h-[500px] border border-slate-200 rounded-lg bg-white overflow-hidden">
          <ChatWidget
            position={config.appearance.position}
            primaryColor={config.appearance.primaryColor}
            secondaryColor={config.appearance.secondaryColor}
            botName={config.content.botName}
            botAvatar={config.content.botAvatar}
            welcomeMessage={config.content.welcomeMessage}
            placeholder={config.content.inputPlaceholder}
            expanded={true}
            darkMode={config.appearance.theme === "dark"}
            showBranding={true}
          />
        </div>
      </div>
    </div>
  );
};

export default WidgetConfigurator;
