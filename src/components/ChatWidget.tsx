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

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai" | "system";
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
  followUps?: string[];
}

interface ChatWidgetProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  primaryColor?: string;
  secondaryColor?: string;
  botName?: string;
  botAvatar?: string;
  welcomeMessage?: string;
  placeholder?: string;
  expanded?: boolean;
  darkMode?: boolean;
  showBranding?: boolean;
}

const ChatWidget = ({
  position = "bottom-right",
  primaryColor = "#4f46e5",
  secondaryColor = "#818cf8",
  botName = "AI Assistant",
  botAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=assistant",
  welcomeMessage = "Hello! How can I help you today?",
  placeholder = "Type your message here...",
  expanded = false,
  darkMode = false,
  showBranding = true,
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
  const inputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Position styles
  const positionStyles = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (message.trim() === "") return;

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
  };

  // Handle follow-up selection
  const handleFollowUp = (followUp: string) => {
    setMessage(followUp);
    if (inputRef.current) {
      inputRef.current.focus();
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

  // Custom styles based on props
  const widgetStyle = {
    "--primary-color": primaryColor,
    "--secondary-color": secondaryColor,
    backgroundColor: darkMode ? "#1f2937" : "#ffffff",
    color: darkMode ? "#f3f4f6" : "#1f2937",
  } as React.CSSProperties;

  return (
    <div
      className={`fixed ${positionStyles[position]} z-50`}
      style={widgetStyle}
    >
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="shadow-lg rounded-lg overflow-hidden"
            style={{
              width: "380px",
              height: "600px",
              backgroundColor: darkMode ? "#1f2937" : "#ffffff",
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                  className="text-white hover:bg-white/20"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </CardHeader>

              <CardContent className="p-0 flex-grow overflow-hidden">
                <ChatMessageList
                  messages={messages}
                  isTyping={isTyping}
                  onFollowUpClick={handleFollowUp}
                  darkMode={darkMode}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
                <div ref={messageEndRef} />
              </CardContent>

              <CardFooter
                className="p-3 border-t"
                style={{ backgroundColor: darkMode ? "#111827" : "#f9fafb" }}
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
                        >
                          <Paperclip className="h-5 w-5" />
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
                      backgroundColor: darkMode ? "#374151" : "#ffffff",
                      color: darkMode ? "#f3f4f6" : "#1f2937",
                    }}
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
                    disabled={message.trim() === ""}
                  >
                    <Send className="h-4 w-4" />
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
            className="flex flex-col items-end"
          >
            {unreadCount > 0 && (
              <Badge
                className="mb-2 animate-bounce"
                style={{ backgroundColor: primaryColor }}
              >
                {unreadCount} new message{unreadCount > 1 ? "s" : ""}
              </Badge>
            )}
            <Button
              onClick={() => setIsExpanded(true)}
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;
