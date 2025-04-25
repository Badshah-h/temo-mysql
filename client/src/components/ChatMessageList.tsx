import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

type MessageType = "user" | "ai" | "system";

interface FollowUpSuggestion {
  id: string;
  text: string;
  action?: "static" | "prompt" | "kb";
}

interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  followUpSuggestions?: FollowUpSuggestion[];
  isTyping?: boolean;
}

interface ChatMessageListProps {
  messages?: Message[];
  isTyping?: boolean;
  onFollowUpClick?: (suggestion: FollowUpSuggestion) => void;
  maxHeight?: string | number;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages = [
    {
      id: "1",
      content: "Hello! How can I help you today?",
      type: "ai",
      timestamp: new Date(),
      followUpSuggestions: [
        { id: "f1", text: "Tell me about your services", action: "prompt" },
        { id: "f2", text: "How does this work?", action: "static" },
      ],
    },
    {
      id: "2",
      content: "I need help with setting up the widget on my website.",
      type: "user",
      timestamp: new Date(Date.now() - 60000),
    },
    {
      id: "3",
      content:
        "Sure, I can help with that. To embed the widget on your website, you'll need to copy the generated code snippet and paste it into your website's HTML. Would you like me to show you how to generate the embed code?",
      type: "ai",
      timestamp: new Date(Date.now() - 30000),
    },
  ],
  isTyping = false,
  onFollowUpClick = () => {},
  maxHeight = "450px",
}) => {
  // Auto-scroll to bottom when new messages arrive
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col w-full h-full bg-background">
      <ScrollArea className="flex-1" style={{ height: maxHeight }}>
        <div className="flex flex-col p-4 gap-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onFollowUpClick={onFollowUpClick}
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
  onFollowUpClick: (suggestion: FollowUpSuggestion) => void;
}> = ({ message, onFollowUpClick }) => {
  const isUser = message.type === "user";
  const isSystem = message.type === "system";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
      <div
        className={`flex items-start gap-2 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {!isUser && (
          <Avatar className="h-8 w-8">
            {message.type === "ai" ? (
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
          >
            {message.content}
          </div>

          {message.followUpSuggestions &&
            message.followUpSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {message.followUpSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion.id}
                    variant="outline"
                    size="sm"
                    onClick={() => onFollowUpClick(suggestion)}
                  >
                    {suggestion.text}
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
