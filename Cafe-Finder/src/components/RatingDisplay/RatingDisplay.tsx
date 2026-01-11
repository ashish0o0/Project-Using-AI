import { memo } from 'react'

type RatingDisplayProps = {
  rating?: number
  maxRating?: number
  showNumber?: boolean
}

export const RatingDisplay = memo(function RatingDisplay({
  rating,
  maxRating = 5,
  showNumber = true,
}: RatingDisplayProps) {
  if (!rating) {
    return <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No rating</span>
  }

  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <div style={{ display: 'flex', gap: '0.125rem' }}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`} style={{ color: '#fbbf24', fontSize: '0.875rem' }}>
            ★
          </span>
        ))}
        {hasHalfStar && (
          <span style={{ color: '#fbbf24', fontSize: '0.875rem', opacity: 0.5 }}>★</span>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
            ★
          </span>
        ))}
      </div>
      {showNumber && (
        <span style={{ fontWeight: 500, fontSize: '0.875rem', color: '#374151' }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
})
