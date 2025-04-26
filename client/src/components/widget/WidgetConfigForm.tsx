import React from "react";
import { WidgetConfig } from "../WidgetConfigurator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface WidgetConfigFormProps {
  config: WidgetConfig;
  section: "appearance" | "behavior" | "content" | "advanced";
  updateConfig: (section: keyof WidgetConfig, key: string, value: any) => void;
}

const WidgetConfigForm: React.FC<WidgetConfigFormProps> = ({
  config,
  section,
  updateConfig,
}) => {
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

  const renderTooltip = (content: string) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground ml-1" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderAppearanceSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center">
            <Label htmlFor="primaryColor">Primary Color</Label>
            {renderTooltip("The main color used for buttons and headers")}
          </div>
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
                updateConfig("appearance", "primaryColor", e.target.value)
              }
            />
          </div>
        </div>

        <div>
          <div className="flex items-center">
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            {renderTooltip("Used for accents and secondary elements")}
          </div>
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
                updateConfig("appearance", "secondaryColor", e.target.value)
              }
            />
          </div>
        </div>

        <div>
          <div className="flex items-center">
            <Label htmlFor="textColor">Text Color</Label>
            {renderTooltip("The color of text in the widget")}
          </div>
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
                updateConfig("appearance", "textColor", e.target.value)
              }
            />
          </div>
        </div>

        <div>
          <div className="flex items-center">
            <Label htmlFor="backgroundColor">Background Color</Label>
            {renderTooltip("The main background color of the widget")}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-8 h-8 rounded-md border"
              style={{
                backgroundColor: config.appearance.backgroundColor,
              }}
            />
            <Input
              id="backgroundColor"
              type="text"
              value={config.appearance.backgroundColor}
              onChange={(e) =>
                updateConfig("appearance", "backgroundColor", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center">
            <Label htmlFor="borderRadius">Border Radius</Label>
            {renderTooltip("Controls how rounded the corners are")}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <Slider
              id="borderRadius"
              min={0}
              max={24}
              step={1}
              value={[config.appearance.borderRadius]}
              onValueChange={(value) =>
                updateConfig("appearance", "borderRadius", value[0])
              }
              className="flex-1"
            />
            <span className="w-8 text-center">
              {config.appearance.borderRadius}px
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center">
            <Label htmlFor="fontFamily">Font Family</Label>
            {renderTooltip("The font used throughout the widget")}
          </div>
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
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center">
            <Label htmlFor="position">Widget Position</Label>
            {renderTooltip("Where the widget appears on the screen")}
          </div>
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
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center">
            <Label htmlFor="theme">Theme</Label>
            {renderTooltip("Light or dark mode for the widget")}
          </div>
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
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center">
              <Label htmlFor="buttonStyle">Button Style</Label>
              {renderTooltip("The style of buttons in the widget")}
            </div>
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
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center">
              <Label htmlFor="size">Widget Size</Label>
              {renderTooltip("The overall size of the widget")}
            </div>
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
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBehaviorSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Label htmlFor="autoOpen">Auto Open Widget</Label>
              {renderTooltip(
                "Automatically open the widget when the page loads",
              )}
            </div>
            <Switch
              id="autoOpen"
              checked={config.behavior.autoOpen}
              onCheckedChange={(checked) =>
                updateConfig("behavior", "autoOpen", checked)
              }
            />
          </div>
        </div>

        {config.behavior.autoOpen && (
          <div>
            <div className="flex items-center">
              <Label htmlFor="autoOpenDelay">Auto Open Delay (seconds)</Label>
              {renderTooltip("How long to wait before opening the widget")}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                id="autoOpenDelay"
                min={0}
                max={30}
                step={1}
                value={[config.behavior.autoOpenDelay]}
                onValueChange={(value) =>
                  updateConfig("behavior", "autoOpenDelay", value[0])
                }
                className="flex-1"
              />
              <span className="w-8 text-center">
                {config.behavior.autoOpenDelay}s
              </span>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Label htmlFor="showNotifications">Show Notifications</Label>
              {renderTooltip("Display notification badges for new messages")}
            </div>
            <Switch
              id="showNotifications"
              checked={config.behavior.showNotifications}
              onCheckedChange={(checked) =>
                updateConfig("behavior", "showNotifications", checked)
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Label htmlFor="enableSound">Enable Sound Effects</Label>
              {renderTooltip("Play sounds for new messages and notifications")}
            </div>
            <Switch
              id="enableSound"
              checked={config.behavior.enableSound}
              onCheckedChange={(checked) =>
                updateConfig("behavior", "enableSound", checked)
              }
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Label htmlFor="enableAnimation">Enable Animations</Label>
              {renderTooltip("Use animations for widget transitions")}
            </div>
            <Switch
              id="enableAnimation"
              checked={config.behavior.enableAnimation}
              onCheckedChange={(checked) =>
                updateConfig("behavior", "enableAnimation", checked)
              }
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Label htmlFor="mobileOptimized">Mobile Optimized</Label>
              {renderTooltip(
                "Adjust widget size and behavior for mobile devices",
              )}
            </div>
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
    </div>
  );

  const renderContentSection = () => (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <div className="flex items-center">
          <Label htmlFor="welcomeMessage">Welcome Message</Label>
          {renderTooltip("The first message users see when opening the chat")}
        </div>
        <Textarea
          id="welcomeMessage"
          className="mt-1"
          value={config.content.welcomeMessage}
          onChange={(e) =>
            updateConfig("content", "welcomeMessage", e.target.value)
          }
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center">
            <Label htmlFor="botName">Bot Name</Label>
            {renderTooltip("The name of your AI assistant")}
          </div>
          <Input
            id="botName"
            className="mt-1"
            value={config.content.botName}
            onChange={(e) => updateConfig("content", "botName", e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center">
            <Label htmlFor="botAvatar">Bot Avatar URL</Label>
            {renderTooltip("The profile image for your AI assistant")}
          </div>
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
                updateConfig("content", "botAvatar", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center">
          <Label htmlFor="inputPlaceholder">Input Placeholder</Label>
          {renderTooltip("The text shown in the empty message input field")}
        </div>
        <Input
          id="inputPlaceholder"
          className="mt-1"
          value={config.content.inputPlaceholder}
          onChange={(e) =>
            updateConfig("content", "inputPlaceholder", e.target.value)
          }
        />
      </div>

      <div>
        <div className="flex items-center">
          <Label htmlFor="offlineMessage">Offline Message</Label>
          {renderTooltip("Message shown when no agents are available")}
        </div>
        <Textarea
          id="offlineMessage"
          className="mt-1"
          value={config.content.offlineMessage}
          onChange={(e) =>
            updateConfig("content", "offlineMessage", e.target.value)
          }
          rows={2}
        />
      </div>
    </div>
  );

  const renderAdvancedSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Label htmlFor="dataCollection">Data Collection</Label>
              {renderTooltip(
                "Collect conversation data for analytics and improvement",
              )}
            </div>
            <Switch
              id="dataCollection"
              checked={config.advanced.dataCollection}
              onCheckedChange={(checked) =>
                updateConfig("advanced", "dataCollection", checked)
              }
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Label htmlFor="analyticsEnabled">Analytics Enabled</Label>
              {renderTooltip("Track usage metrics and conversation analytics")}
            </div>
            <Switch
              id="analyticsEnabled"
              checked={config.advanced.analyticsEnabled}
              onCheckedChange={(checked) =>
                updateConfig("advanced", "analyticsEnabled", checked)
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center">
            <Label htmlFor="rateLimit">Rate Limit (messages per minute)</Label>
            {renderTooltip(
              "Limit how many messages a user can send per minute",
            )}
          </div>
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
            <span className="w-8 text-center">{config.advanced.rateLimit}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Label htmlFor="requireAuthentication">
                Require Authentication
              </Label>
              {renderTooltip("Require users to authenticate before chatting")}
            </div>
            <Switch
              id="requireAuthentication"
              checked={config.advanced.requireAuthentication}
              onCheckedChange={(checked) =>
                updateConfig("advanced", "requireAuthentication", checked)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render the appropriate section based on the section prop
  switch (section) {
    case "appearance":
      return renderAppearanceSection();
    case "behavior":
      return renderBehaviorSection();
    case "content":
      return renderContentSection();
    case "advanced":
      return renderAdvancedSection();
    default:
      return null;
  }
};

export default WidgetConfigForm;
