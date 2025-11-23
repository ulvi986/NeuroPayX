import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { TemplateCard } from "@/components/TemplateCard";
import { templatesApi } from "@/lib/api/templates";
import { Skeleton } from "@/components/ui/skeleton";

export default function Templates() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: templatesApi.getAll,
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Template Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and purchase premium templates for your projects
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                id={template.id}
                title={template.title}
                price={Number(template.price)}
                imageUrl={template.template_images?.[0]?.image_url}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            No templates available yet.
          </p>
        )}
      </div>
    </Layout>
  );
}
