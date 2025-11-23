import { Star } from "lucide-react";

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  showNumber?: boolean;
}

export const RatingDisplay = ({ rating, maxRating = 5, showNumber = true }: RatingDisplayProps) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < Math.floor(rating)
              ? "fill-primary text-primary"
              : "text-muted-foreground"
          }`}
        />
      ))}
      {showNumber && (
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};
