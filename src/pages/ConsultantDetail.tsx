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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ConsultantDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRating, setShowRating] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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
    mutationFn: () => consultantsApi.requestConsultation(id!, user!.id, requestMessage),
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
    mutationFn: (rating: number) => consultantsApi.addRating(id!, user!.id, rating),
    onSuccess: () => {
      toast({ title: "Success", description: "Rating submitted!" });
      queryClient.invalidateQueries({ queryKey: ["consultant-rating"] });
      setShowRating(false);
    },
  });

  const commentMutation = useMutation({
    mutationFn: (comment: string) => consultantsApi.addComment(id!, user!.id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultant"] });
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

            {user && (
              <div className="space-y-3">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Request Consultation
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request a Consultation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Tell the consultant about your needs..."
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        rows={5}
                      />
                      <Button
                        onClick={() => requestMutation.mutate()}
                        disabled={requestMutation.isPending || !requestMessage.trim()}
                        className="w-full"
                      >
                        {requestMutation.isPending ? "Sending..." : "Send Request"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {!showRating ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowRating(true)}
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
            )}
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
