import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ChatMessage {
  id: string;
  sender_type: "visitor" | "agent";
  message: string;
  created_at: string;
}

export const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [visitorId, setVisitorId] = useState<string>("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate or retrieve visitor ID
  useEffect(() => {
    let id = localStorage.getItem("chat_visitor_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("chat_visitor_id", id);
    }
    setVisitorId(id);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Subscribe to new messages
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`chat-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const startChat = async () => {
    if (!visitorName.trim()) return;

    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({
        visitor_id: visitorId,
        visitor_name: visitorName.trim(),
        visitor_email: visitorEmail.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error starting chat:", error);
      return;
    }

    setSessionId(data.id);
    setHasStartedChat(true);

    // Send welcome message from system
    await supabase.from("chat_messages").insert({
      session_id: data.id,
      sender_type: "agent",
      sender_id: "system",
      message: `Hello ${visitorName}! Welcome to our support chat. An agent will be with you shortly.`,
    });

    // Fetch initial messages
    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", data.id)
      .order("created_at", { ascending: true });

    if (msgs) setMessages(msgs as ChatMessage[]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !sessionId || isSending) return;

    setIsSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    const { error } = await supabase.from("chat_messages").insert({
      session_id: sessionId,
      sender_type: "visitor",
      sender_id: visitorId,
      message: messageText,
    });

    if (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageText);
    }

    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (hasStartedChat) {
        sendMessage();
      } else {
        startChat();
      }
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 w-80 md:w-96 bg-background border rounded-lg shadow-xl z-50 flex flex-col transition-all duration-200 ${
        isMinimized ? "h-14" : "h-[500px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold">Live Chat</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {!hasStartedChat ? (
            /* Start chat form */
            <div className="flex-1 p-4 flex flex-col justify-center">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Start a conversation
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Name *
                  </label>
                  <Input
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Your name"
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Email (optional)
                  </label>
                  <Input
                    type="email"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder="your@email.com"
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={startChat}
                  disabled={!visitorName.trim()}
                >
                  Start Chat
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_type === "visitor"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          msg.sender_type === "visitor"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender_type === "visitor"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {format(new Date(msg.created_at), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={handleKeyPress}
                    disabled={isSending}
                  />
                  <Button
                    size="icon"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
