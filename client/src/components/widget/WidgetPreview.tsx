import React from "react";
import { WidgetConfig } from "../WidgetConfigurator";

interface WidgetPreviewProps {
  config: WidgetConfig;
  previewMode?: "desktop" | "mobile" | "tablet";
}

const WidgetPreview: React.FC<WidgetPreviewProps> = ({
  config,
  previewMode = "desktop",
}) => {
  // Determine container styles based on preview mode
  const containerStyles = {
    desktop: "w-full h-full",
    mobile: "w-[375px] h-[667px]",
    tablet: "w-[768px] h-[1024px]",
  };

  return (
    <div
      className={`${containerStyles[previewMode]} rounded-lg overflow-hidden flex flex-col`}
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
          <input
            placeholder={config.content.inputPlaceholder}
            className="flex-1 px-3 py-2 rounded-md border"
            style={{
              backgroundColor: `${config.appearance.textColor}10`,
              color: config.appearance.textColor,
              borderColor: `${config.appearance.textColor}20`,
            }}
          />
          <button
            className="px-4 py-2 rounded-md text-white"
            style={{
              backgroundColor: config.appearance.primaryColor,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetPreview;
