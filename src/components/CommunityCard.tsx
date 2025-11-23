import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";

interface CommunityCardProps {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
}

export const CommunityCard = ({ id, name, description, memberCount }: CommunityCardProps) => {
  return (
    <Link to={`/community/${id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <h3 className="font-semibold text-xl mb-2">{name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description || "Join this community to connect with like-minded professionals"}
          </p>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {memberCount || 0} members
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
};
