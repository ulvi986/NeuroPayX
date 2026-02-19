import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

interface ConsultantCardProps {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  experience?: string;
  pricePerHour: number;
  photoUrl?: string;
}

export const ConsultantCard = ({
  id,
  firstName,
  lastName,
  bio,
  experience,
  pricePerHour,
  photoUrl,
}: ConsultantCardProps) => {
  const fullName = `${firstName} ${lastName}`;

  return (
    <Link to={`/consultants/${id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={photoUrl} alt={fullName} />
              <AvatarFallback>{firstName.charAt(0)}{lastName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1">{fullName}</h3>
              {experience && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{experience}</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {bio || "No bio available"}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="secondary" className="text-base font-semibold">
              ${pricePerHour.toFixed(2)}/saat
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
