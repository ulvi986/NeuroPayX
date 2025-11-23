import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "./ui/button";

interface RatingInputProps {
  onRate: (rating: number) => void;
  maxRating?: number;
}

export const RatingInput = ({ onRate, maxRating = 5 }: RatingInputProps) => {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(0);

  const handleClick = (rating: number) => {
    setSelected(rating);
    onRate(rating);
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => {
        const ratingValue = i + 1;
        return (
          <Button
            key={i}
            variant="ghost"
            size="sm"
            className="p-1"
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
            onClick={() => handleClick(ratingValue)}
          >
            <Star
              className={`h-6 w-6 ${
                ratingValue <= (hover || selected)
                  ? "fill-primary text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        );
      })}
    </div>
  );
};
