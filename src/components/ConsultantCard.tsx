import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

interface ConsultantCardProps {
  id: string;
  name: string;
  description?: string;
  pricePerHour: number;
  photoUrl?: string;
  rating?: number;
}

export const ConsultantCard = ({ 
  id, 
  name, 
  description, 
  pricePerHour, 
  photoUrl, 
  rating 
}: ConsultantCardProps) => {
  return (
    <Link to={`/consultants/${id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={photoUrl} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1">{name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description || "No description available"}
              </p>
              {rating !== undefined && (
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Badge variant="secondary" className="text-base font-semibold">
            ${pricePerHour.toFixed(2)}/hour
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
};
