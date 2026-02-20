import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { consultantsApi } from "@/lib/api/consultants";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Briefcase, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ConsultantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [sending, setSending] = useState(false);

  const { data: consultant, isLoading } = useQuery({
    queryKey: ["consultant", id],
    queryFn: () => consultantsApi.getById(id!),
    enabled: !!id,
  });

  const handleSendEmail = async () => {
    if (!message.trim() || !senderName.trim() || !senderEmail.trim()) {
      toast.error("Bütün sahələri doldurun.");
      return;
    }

    if (!consultant?.email) {
      toast.error("Məsləhətçinin email ünvanı tapılmadı.");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-consultant-email", {
        body: {
          consultantEmail: consultant.email,
          consultantName: `${consultant.first_name} ${consultant.last_name}`,
          senderName: senderName.trim(),
          senderEmail: senderEmail.trim(),
          message: message.trim(),
        },
      });

      if (error) throw error;

      toast.success("Mesajınız uğurla göndərildi!");
      setMessage("");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Mesaj göndərilə bilmədi.");
    }
    setSending(false);
  };

  // Pre-fill user info when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && user) {
      setSenderEmail(user.email || "");
      setSenderName(
        [user.user_metadata?.first_name, user.user_metadata?.last_name]
          .filter(Boolean)
          .join(" ") || ""
      );
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto space-y-8">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Layout>
    );
  }

  if (!consultant) {
    return (
      <Layout>
        <p className="text-center py-12 text-muted-foreground">Məsləhətçi tapılmadı</p>
      </Layout>
    );
  }

  const fullName = `${consultant.first_name} ${consultant.last_name}`;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <Avatar className="h-32 w-32">
            <AvatarImage src={consultant.photo_url || undefined} alt={fullName} />
            <AvatarFallback className="text-3xl">
              {consultant.first_name.charAt(0)}{consultant.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{fullName}</h1>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="secondary" className="text-lg font-semibold">
                  ${Number(consultant.price_per_hour).toFixed(2)}/saat
                </Badge>
                {consultant.is_available && (
                  <Badge variant="default" className="bg-green-600">Əlçatandır</Badge>
                )}
              </div>
            </div>

            {consultant.experience && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-5 w-5" />
                <span className="text-lg">{consultant.experience}</span>
              </div>
            )}

            {consultant.bio && (
              <p className="text-lg text-muted-foreground">{consultant.bio}</p>
            )}

            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Mail className="h-5 w-5 mr-2" />
                  Mesaj göndər
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{fullName} — mesaj göndər</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Adınız *</label>
                    <Input
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email *</label>
                    <Input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="sizin@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Mesaj *</label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      rows={5}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleSendEmail}
                    disabled={sending || !message.trim() || !senderName.trim() || !senderEmail.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sending ? "Göndərilir..." : "Göndər"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Layout>
  );
}
