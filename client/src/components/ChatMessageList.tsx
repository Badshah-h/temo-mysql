import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, Volume } from "lucide-react";
import { Message } from "./ChatWidget";

interface ChatMessageListProps {
  messages: Message[];
  isTyping?: boolean;
  onFollowUpClick?: (followUp: string) => void;
  darkMode?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  maxHeight?: string | number;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages = [],
  isTyping = false,
  onFollowUpClick = () => {},
  darkMode = false,
  primaryColor = "#4f46e5",
  secondaryColor = "#818cf8",
  maxHeight = "450px",
}) => {
  // Auto-scroll to bottom when new messages arrive
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <div className="flex flex-col w-full h-full bg-background">
      <ScrollArea className="flex-1" style={{ height: maxHeight }}>
        <div className="flex flex-col p-4 gap-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onFollowUpClick={onFollowUpClick}
              darkMode={darkMode}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          ))}

          {isTyping && (
            <div className="flex items-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=bot" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

const MessageBubble: React.FC<{
  message: Message;
  onFollowUpClick: (followUp: string) => void;
  darkMode?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}> = ({ message, onFollowUpClick, darkMode, primaryColor, secondaryColor }) => {
  const isUser = message.sender === "user";
  const isSystem = message.sender === "system";

  // Render attachment based on type
  const renderAttachment = (attachment: {
    type: "image" | "file" | "audio";
    url: string;
    name: string;
    size?: number;
  }) => {
    switch (attachment.type) {
      case "image":
        return (
          <div className="mt-2 rounded-md overflow-hidden">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="max-w-full max-h-[200px] object-contain"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {attachment.name}
            </div>
          </div>
        );
      case "audio":
        return (
          <div className="mt-2 p-2 rounded-md bg-muted flex items-center gap-2">
            <Volume className="h-4 w-4" />
            <div className="flex-1 overflow-hidden text-ellipsis">
              <div className="text-sm font-medium">{attachment.name}</div>
              <audio controls className="w-full mt-1">
                <source src={attachment.url} />
              </audio>
            </div>
          </div>
        );
      default:
        return (
          <div className="mt-2 p-2 rounded-md bg-muted flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <div className="flex-1 overflow-hidden text-ellipsis">
              <div className="text-sm font-medium">{attachment.name}</div>
              <div className="text-xs text-muted-foreground">
                {attachment.size
                  ? `${Math.round(attachment.size / 1024)} KB`
                  : ""}
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a
                href={attachment.url}
                download={attachment.name}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
            </Button>
          </div>
        );
    }
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
      <div
        className={`flex items-start gap-2 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {!isUser && (
          <Avatar className="h-8 w-8">
            {message.sender === "ai" ? (
              <>
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=bot" />
                <AvatarFallback>AI</AvatarFallback>
              </>
            ) : (
              <>
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=system" />
                <AvatarFallback>SYS</AvatarFallback>
              </>
            )}
          </Avatar>
        )}

        <div className="flex flex-col gap-2">
          <div
            className={`rounded-lg p-3 ${
              isUser
                ? "bg-primary text-primary-foreground"
                : isSystem
                  ? "bg-muted text-muted-foreground"
                  : "bg-secondary text-secondary-foreground"
            }`}
            style={{
              backgroundColor: isUser
                ? primaryColor
                : isSystem
                  ? undefined
                  : `${primaryColor}20`,
              color: isUser
                ? "#ffffff"
                : isSystem
                  ? undefined
                  : darkMode
                    ? "#f3f4f6"
                    : "#1f2937",
            }}
          >
            {message.content}
          </div>

          {/* Render attachments if any */}
          {message.attachments?.map((attachment, index) => (
            <div key={`${message.id}-attachment-${index}`}>
              {renderAttachment(attachment)}
            </div>
          ))}

          {/* Follow-up suggestions */}
          {message.followUps && message.followUps.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {message.followUps.map((suggestion, index) => (
                <Button
                  key={`${message.id}-followup-${index}`}
                  variant="outline"
                  size="sm"
                  onClick={() => onFollowUpClick(suggestion)}
                  style={{ borderColor: `${secondaryColor}40` }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>

        {isUser && (
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

const TypingIndicator: React.FC = () => {
  return (
    <div className="bg-secondary text-secondary-foreground rounded-lg p-3 inline-flex items-center">
      <motion.div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-current"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default ChatMessageList;
