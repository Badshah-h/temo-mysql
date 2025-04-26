import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Paperclip,
  Smile,
  ChevronDown,
  ChevronUp,
  Loader2,
  Image,
  Mic,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Badge } from "./ui/badge";
import ChatMessageList from "./ChatMessageList";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai" | "system";
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
  followUps?: string[];
  attachments?: Array<{
    type: "image" | "file" | "audio";
    url: string;
    name: string;
    size?: number;
  }>;
}

export interface ChatWidgetProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  fontFamily?: string;
  botName?: string;
  botAvatar?: string;
  welcomeMessage?: string;
  placeholder?: string;
  expanded?: boolean;
  theme?: "light" | "dark" | "system";
  buttonStyle?: "rounded" | "square" | "soft";
  size?: "small" | "medium" | "large";
  autoOpen?: boolean;
  autoOpenDelay?: number;
  showNotifications?: boolean;
  enableSound?: boolean;
  enableAnimation?: boolean;
  mobileOptimized?: boolean;
  offlineMessage?: string;
  showBranding?: boolean;
  onSendMessage?: (message: string) => Promise<void>;
  onFileUpload?: (file: File) => Promise<string>;
  onClose?: () => void;
  onOpen?: () => void;
}

const ChatWidget = ({
  position = "bottom-right",
  primaryColor = "#4f46e5",
  secondaryColor = "#818cf8",
  textColor = "#1f2937",
  backgroundColor = "#ffffff",
  borderRadius = 12,
  fontFamily = "Inter",
  botName = "AI Assistant",
  botAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=assistant",
  welcomeMessage = "Hello! How can I help you today?",
  placeholder = "Type your message here...",
  expanded = false,
  theme = "light",
  buttonStyle = "rounded",
  size = "medium",
  autoOpen = false,
  autoOpenDelay = 5,
  showNotifications = true,
  enableSound = false,
  enableAnimation = true,
  mobileOptimized = true,
  offlineMessage = "We're currently offline. Please leave a message and we'll get back to you soon.",
  showBranding = true,
  onSendMessage,
  onFileUpload,
  onClose,
  onOpen,
}: ChatWidgetProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: welcomeMessage,
      sender: "ai",
      timestamp: new Date(),
      status: "read",
      followUps: [
        "Tell me more about your services",
        "How does this work?",
        "Can I customize this widget?",
      ],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(enableSound);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Position styles
  const positionStyles = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  // Size styles
  const sizeStyles = {
    small: {
      width: "320px",
      height: "500px",
      buttonSize: "h-12 w-12",
      iconSize: "h-5 w-5",
    },
    medium: {
      width: "380px",
      height: "600px",
      buttonSize: "h-14 w-14",
      iconSize: "h-6 w-6",
    },
    large: {
      width: "450px",
      height: "700px",
      buttonSize: "h-16 w-16",
      iconSize: "h-7 w-7",
    },
  };

  // Button style
  const buttonStyles = {
    rounded: "rounded-full",
    square: "rounded-none",
    soft: "rounded-xl",
  };

  // Auto open on load
  useEffect(() => {
    if (autoOpen && !isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(true);
        if (onOpen) onOpen();
      }, autoOpenDelay * 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    // Play sound if enabled
    if (soundEnabled && audioRef.current) {
      audioRef.current
        .play()
        .catch((err) => console.error("Error playing sound:", err));
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
      status: "sent",
    };

    setMessages([...messages, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      // Call external handler if provided
      if (onSendMessage) {
        await onSendMessage(message);
      }

      // Simulate AI response after a delay
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "Thank you for your message. This is a simulated response from the AI assistant.",
          sender: "ai",
          timestamp: new Date(),
          status: "delivered",
          followUps: [
            "Tell me more",
            "How can I customize this?",
            "What features are available?",
          ],
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content:
            "Sorry, there was an error processing your request. Please try again later.",
          sender: "system",
          timestamp: new Date(),
        },
      ]);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    try {
      let fileUrl = "";

      if (onFileUpload) {
        fileUrl = await onFileUpload(file);
      } else {
        // Mock file upload
        await new Promise((resolve) => setTimeout(resolve, 1000));
        fileUrl = URL.createObjectURL(file);
      }

      // Determine file type
      const fileType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("audio/")
          ? "audio"
          : "file";

      // Add file message
      const fileMessage: Message = {
        id: Date.now().toString(),
        content: `Sent ${fileType}: ${file.name}`,
        sender: "user",
        timestamp: new Date(),
        attachments: [
          {
            type: fileType as "image" | "file" | "audio",
            url: fileUrl,
            name: file.name,
            size: file.size,
          },
        ],
      };

      setMessages([...messages, fileMessage]);
    } catch (error) {
      console.error("Error uploading file:", error);

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content:
            "Sorry, there was an error uploading your file. Please try again.",
          sender: "system",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle follow-up selection
  const handleFollowUp = (followUp: string) => {
    setMessage(followUp);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Toggle widget expansion
  const toggleWidget = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    if (newExpandedState && onOpen) {
      onOpen();
    } else if (!newExpandedState && onClose) {
      onClose();
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update unread count when widget is minimized
  useEffect(() => {
    if (!isExpanded) {
      const unreadMessages = messages.filter(
        (msg) => msg.sender === "ai" && msg.status !== "read",
      );
      setUnreadCount(unreadMessages.length);
    } else {
      // Mark all as read when expanded
      setUnreadCount(0);
      setMessages(messages.map((msg) => ({ ...msg, status: "read" })));
    }
  }, [isExpanded, messages]);

  // Apply dark mode if theme is dark or system preference is dark
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Custom styles based on props
  const widgetStyle = {
    "--primary-color": primaryColor,
    "--secondary-color": secondaryColor,
    "--text-color": textColor,
    "--bg-color": backgroundColor,
    "--border-radius": `${borderRadius}px`,
    fontFamily: fontFamily,
    backgroundColor: isDarkMode ? "#1f2937" : backgroundColor,
    color: isDarkMode ? "#f3f4f6" : textColor,
  } as React.CSSProperties;

  return (
    <div
      className={`fixed ${positionStyles[position]} z-50`}
      style={widgetStyle}
    >
      {/* Sound effect audio element */}
      <audio ref={audioRef} src="/message-sound.mp3" preload="auto" />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
      />

      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: enableAnimation ? 0.3 : 0 }}
            className="shadow-lg rounded-lg overflow-hidden"
            style={{
              width: sizeStyles[size].width,
              height: sizeStyles[size].height,
              borderRadius: `${borderRadius}px`,
              backgroundColor: isDarkMode ? "#1f2937" : backgroundColor,
            }}
          >
            <Card
              className="border-0 h-full flex flex-col"
              style={{ backgroundColor: "inherit", color: "inherit" }}
            >
              <CardHeader
                className="p-4 border-b flex justify-between items-center"
                style={{ backgroundColor: primaryColor, color: "#ffffff" }}
              >
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={botAvatar} alt={botName} />
                    <AvatarFallback>{botName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{botName}</h3>
                    <p className="text-xs opacity-80">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="text-white hover:bg-white/20"
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleWidget}
                    className="text-white hover:bg-white/20"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0 flex-grow overflow-hidden">
                <ChatMessageList
                  messages={messages}
                  isTyping={isTyping}
                  onFollowUpClick={handleFollowUp}
                  darkMode={isDarkMode}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
                <div ref={messageEndRef} />
              </CardContent>

              <CardFooter
                className="p-3 border-t"
                style={{ backgroundColor: isDarkMode ? "#111827" : "#f9fafb" }}
              >
                <form
                  className="flex w-full items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Paperclip className="h-5 w-5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Attach file</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1"
                    style={{
                      backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                      color: isDarkMode ? "#f3f4f6" : textColor,
                    }}
                    disabled={isTyping}
                  />

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground"
                        >
                          <Smile className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add emoji</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    type="submit"
                    size="icon"
                    style={{ backgroundColor: primaryColor }}
                    disabled={message.trim() === "" || isTyping}
                  >
                    {isTyping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </CardFooter>

              {showBranding && (
                <div className="text-center py-1 text-xs text-muted-foreground">
                  Powered by AI Chat Widget
                </div>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: enableAnimation ? 0.3 : 0 }}
            className="flex flex-col items-end"
          >
            {showNotifications && unreadCount > 0 && (
              <Badge
                className="mb-2 animate-bounce"
                style={{ backgroundColor: primaryColor }}
              >
                {unreadCount} new message{unreadCount > 1 ? "s" : ""}
              </Badge>
            )}
            <Button
              onClick={toggleWidget}
              size="icon"
              className={`${sizeStyles[size].buttonSize} ${buttonStyles[buttonStyle]} shadow-lg`}
              style={{ backgroundColor: primaryColor }}
            >
              <MessageCircle className={sizeStyles[size].iconSize} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;
