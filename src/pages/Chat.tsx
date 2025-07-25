import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hello! I'm your AI research assistant. I can help you find papers, explain concepts, and analyze research trends. What would you like to explore today?",
    sender: "assistant",
    timestamp: new Date(Date.now() - 10000)
  }
];

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand you're interested in that topic. Let me search through the latest research papers and provide you with relevant findings...",
        sender: "assistant",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AppLayout headerTitle="AI Research Chat" showMenu={false}>
      <div className="flex flex-col h-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              
              <Card
                className={`max-w-[80%] p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.sender === "user" 
                    ? "text-primary-foreground/70" 
                    : "text-muted-foreground"
                }`}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </Card>
              
              {message.sender === "user" && (
                <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-accent-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about research papers, trends, or concepts..."
              className="flex-1"
            />
            <Button 
              onClick={sendMessage}
              disabled={!inputValue.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick prompts */}
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {[
              "Latest papers on transformers",
              "Explain neural networks",
              "Find ML papers from 2024"
            ].map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                onClick={() => setInputValue(prompt)}
                className="whitespace-nowrap flex-shrink-0"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}