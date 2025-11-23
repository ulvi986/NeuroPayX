import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { profilesApi } from "@/lib/api/profiles";
import { templatesApi } from "@/lib/api/templates";
import { consultantsApi } from "@/lib/api/consultants";
import { communityApi } from "@/lib/api/community";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, MessageSquare, Users } from "lucide-react";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => profilesApi.getById(user!.id),
    enabled: !!user,
  });

  const { data: purchases } = useQuery({
    queryKey: ["user-purchases", user?.id],
    queryFn: () => templatesApi.getUserPurchases(user!.id),
    enabled: !!user,
  });

  const { data: consultationRequests } = useQuery({
    queryKey: ["user-requests", user?.id],
    queryFn: () => consultantsApi.getUserRequests(user!.id),
    enabled: !!user,
  });

  const { data: communities } = useQuery({
    queryKey: ["user-communities", user?.id],
    queryFn: () => communityApi.getUserCommunities(user!.id),
    enabled: !!user,
  });

  if (authLoading || profileLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <p className="text-center">Profile not found</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {profile.first_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-muted-foreground">{profile.email}</p>
              {profile.bio && (
                <p className="mt-2">{profile.bio}</p>
              )}
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Purchased Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {purchases && purchases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{purchase.templates?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Purchased {new Date(purchase.purchased_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      ${Number(purchase.templates?.price).toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No templates purchased yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Consultation Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {consultationRequests && consultationRequests.length > 0 ? (
              <div className="space-y-4">
                {consultationRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{request.consultants?.name}</h3>
                      <Badge>{request.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Requested {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No consultation requests yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {communities && communities.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {communities.map((membership) => (
                  <Badge key={membership.id} variant="outline" className="text-base py-2 px-4">
                    {membership.communities?.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Not a member of any communities yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
