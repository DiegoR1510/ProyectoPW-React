import React from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  readonly = false,
  onRatingChange 
}) => {
  const sizeClasses = {
    sm: 'fs-6',
    md: 'fs-5',
    lg: 'fs-4'
  };

  const handleStarClick = (starIndex: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  const handleStarHover = (starIndex: number) => {
    if (!readonly) {
      // Add hover effect if needed
    }
  };

  return (
    <div className="d-flex align-items-center">
      {[...Array(maxRating)].map((_, index) => (
        <span
          key={index}
          className={`${sizeClasses[size]} ${readonly ? '' : 'cursor-pointer'}`}
          style={{ 
            cursor: readonly ? 'default' : 'pointer',
            color: index < rating ? '#ffc107' : '#e4e5e9'
          }}
          onClick={() => handleStarClick(index)}
          onMouseEnter={() => handleStarHover(index)}
        >
          ★
        </span>
      ))}
      {!readonly && (
        <span className="ms-2 text-muted small">({rating}/{maxRating})</span>
      )}
    </div>
  );
};

export default StarRating; 