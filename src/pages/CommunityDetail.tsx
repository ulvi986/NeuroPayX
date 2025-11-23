import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { communityApi } from "@/lib/api/community";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, UserMinus, Users, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { CommunityChat } from "@/components/CommunityChat";
import { useEffect } from "react";
export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;

  const { data: community, isLoading: isCommunityLoading } = useQuery({
    queryKey: ["community", id],
    queryFn: () => communityApi.getById(id!),
    enabled: !!id,
  });

  const { data: isMember } = useQuery({
    queryKey: ["community-membership", id, userId],
    queryFn: () => communityApi.checkMembership(id!, userId!),
    enabled: !!id && !!userId && !loading,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["community-messages", id],
    queryFn: () => communityApi.getMessages(id!),
    enabled: !!id && !!isMember,
  });

  useEffect(() => {
    const handleNewMessage = () => {
      refetchMessages();
    };
    
    window.addEventListener('new-message', handleNewMessage);
    return () => window.removeEventListener('new-message', handleNewMessage);
  }, [refetchMessages]);

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("You must be logged in to join this community.");
      }
      return communityApi.join(id!, userId);
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
    mutationFn: async () => {
      if (!userId) {
        throw new Error("You must be logged in to leave this community.");
      }
      return communityApi.leave(id!, userId);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Left community" });
      queryClient.invalidateQueries({ queryKey: ["community"] });
      queryClient.invalidateQueries({ queryKey: ["community-membership"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!userId) {
        throw new Error("You must be logged in to send messages.");
      }
      return communityApi.sendMessage(id!, userId, message);
    },
    onSuccess: () => {
      refetchMessages();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isCommunityLoading) {
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
      <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-6">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">{community.name}</h1>
          <p className="text-base md:text-lg text-muted-foreground">{community.description}</p>

          <div className="flex flex-wrap gap-2">
            {isMember ? (
              <Button
                variant="outline"
                onClick={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending || !userId || loading}
                className="w-full sm:w-auto"
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Leave Community
              </Button>
            ) : (
              <Button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending || !userId || loading}
                className="w-full sm:w-auto"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Join Community
              </Button>
            )}
          </div>
        </div>

        {isMember && (
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Members</span>
                <span className="ml-1">({members.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <CommunityChat
                communityId={id!}
                userId={userId}
                messages={messages}
                onSendMessage={(msg) => sendMessageMutation.mutate(msg)}
                isSending={sendMessageMutation.isPending}
              />
            </TabsContent>

            <TabsContent value="members">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={member.profiles?.avatar_url || undefined} />
                        <AvatarFallback>
                          {member.profiles?.first_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">
                          {member.profiles?.first_name} {member.profiles?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
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
            </TabsContent>
          </Tabs>
        )}

        {!isMember && (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              Join this community to access chat and see all members
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
