import { Star, StarHalf, StarOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  rating: number;
  maxRating?: number;
  className?: string;
  starClassName?: string;
};

export default function StarRating({
  rating,
  maxRating = 5,
  className,
  starClassName,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = maxRating - fullStars - halfStar;

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className={cn('h-4 w-4 text-accent fill-accent', starClassName)}
        />
      ))}
      {halfStar === 1 && (
        <StarHalf
          key="half"
          className={cn('h-4 w-4 text-accent fill-accent', starClassName)}
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={cn('h-4 w-4 text-muted-foreground/50', starClassName)}
        />
      ))}
    </div>
  );
}
