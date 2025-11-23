import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { communityApi } from "@/lib/api/community";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, UserMinus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: community, isLoading } = useQuery({
    queryKey: ["community", id],
    queryFn: () => communityApi.getById(id!),
    enabled: !!id,
  });

  const { data: isMember } = useQuery({
    queryKey: ["community-membership", id, user?.id],
    queryFn: () => communityApi.checkMembership(id!, user!.id),
    enabled: !!id && !!user,
  });

  const joinMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("You must be logged in to join");
      return communityApi.join(id!, user.id);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Joined community!" });
      queryClient.invalidateQueries({ queryKey: ["community"] });
      queryClient.invalidateQueries({ queryKey: ["community-membership"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("You must be logged in to leave");
      return communityApi.leave(id!, user.id);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Left community" });
      queryClient.invalidateQueries({ queryKey: ["community"] });
      queryClient.invalidateQueries({ queryKey: ["community-membership"] });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!community) {
    return (
      <Layout>
        <p className="text-center">Community not found</p>
      </Layout>
    );
  }

  const members = community.community_members || [];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{community.name}</h1>
          <p className="text-lg text-muted-foreground">{community.description}</p>

          {user ? (
            <div>
              {isMember ? (
                <Button
                  variant="outline"
                  onClick={() => leaveMutation.mutate()}
                  disabled={leaveMutation.isPending}
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Leave Community
                </Button>
              ) : (
                <Button
                  onClick={() => joinMutation.mutate()}
                  disabled={joinMutation.isPending}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Join Community
                </Button>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Please <a href="/auth" className="text-primary hover:underline">sign in</a> to join this community
            </p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Members ({members.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.profiles?.first_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {member.profiles?.first_name} {member.profiles?.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.profiles?.email}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {members.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No members yet. Be the first to join!
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
