import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Message {
  id: string;
  message: string;
  created_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface CommunityChatProps {
  communityId: string;
  userId: string | null;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isSending: boolean;
}

export const CommunityChat = ({ 
  communityId, 
  userId, 
  messages, 
  onSendMessage,
  isSending 
}: CommunityChatProps) => {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `community_id=eq.${communityId}`
        },
        () => {
          // Trigger a refetch by the parent component
          window.dispatchEvent(new CustomEvent('new-message'));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || isSending) return;
    
    onSendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <Card className="flex flex-col h-[400px] md:h-[500px]">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={msg.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {msg.profiles?.first_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-medium text-sm">
                      {msg.profiles?.first_name} {msg.profiles?.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(msg.created_at), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm mt-1 break-words">{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={userId ? "Type a message..." : "Join to send messages"}
            disabled={!userId || isSending}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!userId || !newMessage.trim() || isSending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};