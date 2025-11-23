import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ConsultantCard } from "@/components/ConsultantCard";
import { consultantsApi } from "@/lib/api/consultants";
import { Skeleton } from "@/components/ui/skeleton";

export default function Consultants() {
  const { data: consultants, isLoading } = useQuery({
    queryKey: ["consultants"],
    queryFn: consultantsApi.getAll,
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Find a Consultant</h1>
          <p className="text-muted-foreground">
            Connect with expert consultants for personalized guidance
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        ) : consultants && consultants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {consultants.map((consultant) => (
              <ConsultantCard
                key={consultant.id}
                id={consultant.id}
                name={consultant.name}
                description={consultant.description || undefined}
                pricePerHour={Number(consultant.price_per_hour)}
                photoUrl={consultant.photo_url || undefined}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            No consultants available yet.
          </p>
        )}
      </div>
    </Layout>
  );
}
