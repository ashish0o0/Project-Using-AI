import { memo } from 'react'
import { useCafeDiscoveryStore } from '../state/cafeDiscoveryStore'
import type { Cafe } from '../types'

type DirectionsButtonProps = {
  lat: number
  lng: number
  userLocation: { lat: number; lng: number } | null
  cafe?: Cafe
}

export const DirectionsButton = memo(function DirectionsButton({
  lat,
  lng,
  userLocation,
  cafe,
}: DirectionsButtonProps) {
  const { showDirectionsTo, hideDirections, showDirections, directionsTo } = useCafeDiscoveryStore()

  if (!lat || !lng) return null

  const isActive = showDirections && directionsTo?.lat === lat && directionsTo?.lng === lng

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isActive) {
      hideDirections()
    } else if (userLocation) {
      const address = cafe?.address || cafe?.addressDetails 
        ? `${cafe.addressDetails?.street || ''}${cafe.addressDetails?.street && cafe.addressDetails?.city ? ', ' : ''}${cafe.addressDetails?.city || ''}`.trim() || cafe.address || null
        : null
      showDirectionsTo(lat, lng, address, cafe?.isOpenNow)
    }
  }

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <button
        onClick={handleClick}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: isActive ? '#ef4444' : '#3b2f2f',
          color: '#ffffff',
          borderRadius: '0.375rem',
          border: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = '#4a3a3a'
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = '#3b2f2f'
          }
        }}
        disabled={!userLocation}
      >
        {isActive ? '✕ Hide Directions' : '🧭 Get Directions'}
      </button>

    </div>
  )
})
