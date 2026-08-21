import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  max = 5,
  size = 'md',
  showNumber = false,
  reviewCount,
  interactive = false,
  onRatingChange,
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const stars = [];
  for (let i = 1; i <= max; i++) {
    const isFilled = rating >= i;
    const isHalf = !isFilled && rating >= i - 0.5;

    stars.push(
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onRatingChange?.(i)}
        className={`${interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'} focus:outline-none`}
      >
        {isFilled ? (
          <Star className={`${sizeClasses[size]} fill-amber-400 text-amber-400`} />
        ) : isHalf ? (
          <StarHalf className={`${sizeClasses[size]} fill-amber-400 text-amber-400`} />
        ) : (
          <Star className={`${sizeClasses[size]} text-zinc-300 dark:text-zinc-600`} />
        )}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">{stars}</div>
      {showNumber && (
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
