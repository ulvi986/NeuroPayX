import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { RatingDisplay } from "@/components/RatingDisplay";
import { RatingInput } from "@/components/RatingInput";
import { CommentSection } from "@/components/CommentSection";
import { consultantsApi } from "@/lib/api/consultants";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

export default function ConsultantDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRating, setShowRating] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;

  const { data: consultant, isLoading } = useQuery({
    queryKey: ["consultant", id],
    queryFn: () => consultantsApi.getById(id!),
    enabled: !!id,
  });

  const { data: avgRating } = useQuery({
    queryKey: ["consultant-rating", id],
    queryFn: () => consultantsApi.getAverageRating(id!),
    enabled: !!id,
  });

  const requestMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("You must be logged in to request a consultation.");
      }
      return consultantsApi.requestConsultation(id!, userId, requestMessage);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Consultation request sent!" });
      setRequestMessage("");
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      if (!userId) {
        throw new Error("You must be logged in to rate this consultant.");
      }
      return consultantsApi.addRating(id!, userId, rating);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Rating submitted!" });
      queryClient.invalidateQueries({ queryKey: ["consultant-rating"] });
      setShowRating(false);
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (comment: string) => {
      if (!userId) {
        throw new Error("You must be logged in to comment.");
      }
      return consultantsApi.addComment(id!, userId, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultant"] });
    },
  });

  const demoRequestMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !user?.email) {
        throw new Error("You must be logged in to request a demo.");
      }
      if (!consultant) {
        throw new Error("Consultant not found.");
      }

      const { data: consultantProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", consultant.user_id)
        .single();

      if (!consultantProfile?.email) {
        throw new Error("Consultant email not found.");
      }

      const response = await supabase.functions.invoke("send-demo-request", {
        body: {
          recipientEmail: consultantProfile.email,
          itemName: consultant.name,
          itemType: "Consultant",
          userEmail: user.email,
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "Demo request sent to the consultant!" 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Layout>
    );
  }

  if (!consultant) {
    return (
      <Layout>
        <p className="text-center">Consultant not found</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <Avatar className="h-32 w-32">
            <AvatarImage src={consultant.photo_url || undefined} alt={consultant.name} />
            <AvatarFallback className="text-3xl">
              {consultant.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{consultant.name}</h1>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-lg font-semibold">
                  ${Number(consultant.price_per_hour).toFixed(2)}/hour
                </Badge>
                {avgRating !== undefined && (
                  <RatingDisplay rating={avgRating} />
                )}
              </div>
            </div>

            <p className="text-lg text-muted-foreground">{consultant.description}</p>

            <div className="space-y-3">
              <Button 
                size="lg" 
                onClick={() => demoRequestMutation.mutate()}
                disabled={!userId || loading || demoRequestMutation.isPending}
              >
                {demoRequestMutation.isPending ? "Sending..." : "Book a Demo"}
              </Button>

              {!showRating ? (
                <Button
                  variant="outline"
                  onClick={() => setShowRating(true)}
                  disabled={!userId || loading}
                >
                  Rate this consultant
                </Button>
              ) : (
                <div className="p-4 border rounded-lg space-y-3">
                  <p className="font-medium">Rate this consultant:</p>
                  <RatingInput onRate={(rating) => ratingMutation.mutate(rating)} />
                </div>
              )}
            </div>
          </div>
        </div>

        <CommentSection
          comments={consultant.consultant_comments || []}
          onAddComment={(comment) => commentMutation.mutateAsync(comment)}
        />
      </div>
    </Layout>
  );
}
