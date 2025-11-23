import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { CommunityCard } from "@/components/CommunityCard";
import { communityApi } from "@/lib/api/community";
import { Skeleton } from "@/components/ui/skeleton";

export default function Community() {
  const { data: communities, isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: communityApi.getAll,
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Community Groups</h1>
          <p className="text-muted-foreground">
            Join communities and connect with professionals in your field
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        ) : communities && communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                name={community.name}
                description={community.description || undefined}
                memberCount={(community as any).memberCount}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            No communities available yet.
          </p>
        )}
      </div>
    </Layout>
  );
}
