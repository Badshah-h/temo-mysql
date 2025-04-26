import { WidgetConfig } from "../WidgetConfigurator";

export interface WidgetPreset {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  config: WidgetConfig;
}

export const widgetPresets: WidgetPreset[] = [
  {
    id: "modern-clean",
    name: "Modern Clean",
    description:
      "A clean, modern design with rounded corners and a professional look",
    thumbnail:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
    config: {
      appearance: {
        primaryColor: "#4F46E5",
        secondaryColor: "#818CF8",
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
    },
  },
  {
    id: "dark-mode",
    name: "Dark Mode",
    description:
      "A sleek dark theme that's easy on the eyes and perfect for dark websites",
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
    config: {
      appearance: {
        primaryColor: "#6D28D9",
        secondaryColor: "#8B5CF6",
        textColor: "#E5E7EB",
        backgroundColor: "#1F2937",
        borderRadius: 8,
        fontFamily: "Inter",
        position: "bottom-right",
        theme: "dark",
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
        botName: "AI Support",
        botAvatar:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=support&backgroundColor=6D28D9",
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
    },
  },
  {
    id: "glass-effect",
    name: "Glass Effect",
    description: "A modern glassmorphism design with a translucent effect",
    thumbnail:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80",
    config: {
      appearance: {
        primaryColor: "#0EA5E9",
        secondaryColor: "#38BDF8",
        textColor: "#0F172A",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 16,
        fontFamily: "Poppins",
        position: "bottom-right",
        theme: "light",
        buttonStyle: "soft",
        size: "medium",
      },
      behavior: {
        autoOpen: true,
        autoOpenDelay: 3,
        showNotifications: true,
        enableSound: true,
        enableAnimation: true,
        mobileOptimized: true,
      },
      content: {
        welcomeMessage: "👋 Hi there! Need any help today?",
        botName: "Glass AI",
        botAvatar:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=glass&backgroundColor=0EA5E9",
        inputPlaceholder: "Ask me anything...",
        offlineMessage:
          "We're currently away. Drop us a message and we'll respond soon!",
      },
      advanced: {
        dataCollection: true,
        analyticsEnabled: true,
        rateLimit: 15,
        requireAuthentication: false,
      },
    },
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description:
      "A clean, minimalist design with square corners and subtle styling",
    thumbnail:
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
    config: {
      appearance: {
        primaryColor: "#000000",
        secondaryColor: "#404040",
        textColor: "#000000",
        backgroundColor: "#FFFFFF",
        borderRadius: 0,
        fontFamily: "Inter",
        position: "bottom-right",
        theme: "light",
        buttonStyle: "square",
        size: "small",
      },
      behavior: {
        autoOpen: false,
        autoOpenDelay: 0,
        showNotifications: false,
        enableSound: false,
        enableAnimation: false,
        mobileOptimized: true,
      },
      content: {
        welcomeMessage: "How may I assist you?",
        botName: "Assistant",
        botAvatar:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=minimal&backgroundColor=000000",
        inputPlaceholder: "Type here...",
        offlineMessage: "Currently unavailable. Please leave a message.",
      },
      advanced: {
        dataCollection: true,
        analyticsEnabled: false,
        rateLimit: 5,
        requireAuthentication: false,
      },
    },
  },
  {
    id: "soft-rounded",
    name: "Soft Rounded",
    description: "A friendly design with soft colors and rounded elements",
    thumbnail:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
    config: {
      appearance: {
        primaryColor: "#EC4899",
        secondaryColor: "#F472B6",
        textColor: "#1F2937",
        backgroundColor: "#FDF2F8",
        borderRadius: 20,
        fontFamily: "Poppins",
        position: "bottom-right",
        theme: "light",
        buttonStyle: "rounded",
        size: "medium",
      },
      behavior: {
        autoOpen: true,
        autoOpenDelay: 2,
        showNotifications: true,
        enableSound: true,
        enableAnimation: true,
        mobileOptimized: true,
      },
      content: {
        welcomeMessage: "Hi there! 👋 How can I make your day better?",
        botName: "Friendly AI",
        botAvatar:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=friendly&backgroundColor=EC4899",
        inputPlaceholder: "Type your question here...",
        offlineMessage:
          "We're not around right now, but we'd love to hear from you!",
      },
      advanced: {
        dataCollection: true,
        analyticsEnabled: true,
        rateLimit: 20,
        requireAuthentication: false,
      },
    },
  },
];
