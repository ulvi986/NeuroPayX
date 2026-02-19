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
          <h1 className="text-4xl font-bold mb-2">Məsləhətçilər</h1>
          <p className="text-muted-foreground">
            Peşəkar məsləhətçilərlə əlaqə saxlayın
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        ) : consultants && consultants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {consultants.map((c) => (
              <ConsultantCard
                key={c.id}
                id={c.id}
                firstName={c.first_name}
                lastName={c.last_name}
                bio={c.bio || undefined}
                experience={c.experience || undefined}
                pricePerHour={Number(c.price_per_hour)}
                photoUrl={c.photo_url || undefined}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            Hələlik məsləhətçi yoxdur.
          </p>
        )}
      </div>
    </Layout>
  );
}
