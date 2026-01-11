import { memo, useMemo } from 'react'
import { CafeCard } from './CafeCard'
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner'
import type { Cafe } from '../types'

type CafeListProps = {
  cafes?: Cafe[]
  isLoading?: boolean
  selectedCafeId?: string | null
  onCafeClick?: (cafe: Cafe) => void
  userLocation?: { lat: number; lng: number } | null
  viewMode?: 'list' | 'sidebar'
}

export const CafeList = memo(function CafeList({
  cafes = [],
  isLoading = false,
  selectedCafeId,
  onCafeClick,
  userLocation,
  viewMode = 'sidebar',
}: CafeListProps) {
  if (isLoading) {
    return <LoadingSpinner size="medium" />
  }

  if (cafes.length === 0) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.875rem',
        }}
      >
        No cafés found. Try adjusting your search or filters.
      </div>
    )
  }

  const cafeCards = useMemo(
    () =>
      cafes.map((cafe) => (
        <CafeCard
          key={cafe.id}
          cafe={cafe}
          isSelected={selectedCafeId === cafe.id}
          onClick={() => onCafeClick?.(cafe)}
          userLocation={userLocation}
          viewMode={viewMode}
        />
      )),
    [cafes, selectedCafeId, onCafeClick, userLocation, viewMode]
  )

  return (
    <div style={viewMode === 'list' ? { display: 'flex', flexDirection: 'column', gap: '1rem' } : {}}>
      {cafeCards}
    </div>
  )
})

