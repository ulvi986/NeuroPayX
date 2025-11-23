import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

interface TemplateCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  rating?: number;
}

export const TemplateCard = ({ id, title, price, imageUrl, rating }: TemplateCardProps) => {
  return (
    <Link to={`/templates/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="object-cover w-full h-full" />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
          <div className="flex items-center gap-2">
            {rating !== undefined && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Badge variant="secondary" className="text-base font-semibold">
            ${price.toFixed(2)}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
};
