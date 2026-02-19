import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { consultantsApi } from "@/lib/api/consultants";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Briefcase } from "lucide-react";
import { toast } from "sonner";

export default function ConsultantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const { data: consultant, isLoading } = useQuery({
    queryKey: ["consultant", id],
    queryFn: () => consultantsApi.getById(id!),
    enabled: !!id,
  });

  const handleMessage = async () => {
    if (!user) {
      toast.error("Mesaj göndərmək üçün daxil olmalısınız.");
      navigate("/auth");
      return;
    }
    try {
      const conversationId = await consultantsApi.getOrCreateConversation(id!, user.id);
      navigate(`/conversations/${conversationId}`);
    } catch (err: any) {
      toast.error(err.message || "Xəta baş verdi");
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

            <Button size="lg" onClick={handleMessage} disabled={loading}>
              <MessageSquare className="h-5 w-5 mr-2" />
              Mesaj göndər
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
