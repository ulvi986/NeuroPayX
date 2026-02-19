import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { consultantsApi, Message } from "@/lib/api/consultants";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, ArrowLeft } from "lucide-react";

export default function Conversation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => consultantsApi.getConversationMessages(id!),
    enabled: !!id,
    refetchInterval: false,
  });

  // Realtime subscription
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`messages-${id}`)
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !id) return;
    setSending(true);
    try {
      await consultantsApi.sendMessage(id, user.id, newMessage.trim());
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <Layout>
        <Skeleton className="h-96 w-full" />
      </Layout>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-200px)]">
        <div className="flex items-center gap-3 pb-4 border-b mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Söhbət</h1>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-3/4" />
            ))
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => {
              const isOwn = msg.sender_id === user.id;
              const senderName = msg.profiles
                ? `${msg.profiles.first_name || ""} ${msg.profiles.last_name || ""}`.trim()
                : "İstifadəçi";

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={msg.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {senderName.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[70%] rounded-xl px-4 py-2 ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-medium mb-1 opacity-70">{senderName}</p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-[10px] mt-1 opacity-50">
                      {new Date(msg.created_at).toLocaleTimeString("az-AZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Hələ mesaj yoxdur. İlk mesajı göndərin!
            </p>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Mesajınızı yazın..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
          />
          <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
