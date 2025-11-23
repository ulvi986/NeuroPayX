import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingDisplay } from "@/components/RatingDisplay";
import { RatingInput } from "@/components/RatingInput";
import { CommentSection } from "@/components/CommentSection";
import { templatesApi } from "@/lib/api/templates";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

export default function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRating, setShowRating] = useState(false);
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;

  const { data: template, isLoading } = useQuery({
    queryKey: ["template", id],
    queryFn: () => templatesApi.getById(id!),
    enabled: !!id,
  });

  const { data: avgRating } = useQuery({
    queryKey: ["template-rating", id],
    queryFn: () => templatesApi.getAverageRating(id!),
    enabled: !!id,
  });

  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      if (!userId) {
        throw new Error("You must be logged in to rate this template.");
      }
      return templatesApi.addRating(id!, userId, rating);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Rating submitted!" });
      queryClient.invalidateQueries({ queryKey: ["template-rating"] });
      setShowRating(false);
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (comment: string) => {
      if (!userId) {
        throw new Error("You must be logged in to comment on this template.");
      }
      return templatesApi.addComment(id!, userId, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template"] });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Layout>
    );
  }

  if (!template) {
    return (
      <Layout>
        <p className="text-center">Template not found</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {template.template_images && template.template_images.length > 0 ? (
              <img
                src={template.template_images[0].image_url}
                alt={template.title}
                className="w-full rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
                No image available
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{template.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary" className="text-xl font-bold">
                  ${Number(template.price).toFixed(2)}
                </Badge>
                {avgRating !== undefined && (
                  <RatingDisplay rating={avgRating} />
                )}
              </div>
            </div>

            <p className="text-lg text-muted-foreground">{template.description}</p>

            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Download className="mr-2 h-5 w-5" />
                Download Template
              </Button>

              {!showRating ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowRating(true)}
                  disabled={!userId || loading}
                >
                  Rate this template
                </Button>
              ) : (
                <div className="p-4 border rounded-lg space-y-3">
                  <p className="font-medium">Rate this template:</p>
                  <RatingInput onRate={(rating) => ratingMutation.mutate(rating)} />
                </div>
              )}
            </div>
          </div>
        </div>

        <CommentSection
          comments={template.template_comments || []}
          onAddComment={(comment) => commentMutation.mutateAsync(comment)}
        />
      </div>
    </Layout>
  );
}
