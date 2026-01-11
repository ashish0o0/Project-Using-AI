import { memo } from 'react'
import type { Cafe } from '../types'
import { RatingDisplay } from '../../../components/RatingDisplay/RatingDisplay'
import { formatDistance, getDisplayAddress } from '../../../utils/distance'
import { DirectionsButton } from './DirectionsButton'

type CafeCardProps = {
  cafe: Cafe
  onClick?: () => void
  isSelected?: boolean
  userLocation?: { lat: number; lng: number } | null
  viewMode?: 'list' | 'sidebar'
}

export const CafeCard = memo(function CafeCard({ cafe, onClick, isSelected, userLocation, viewMode = 'sidebar' }: CafeCardProps) {
  const isListView = viewMode === 'list'
  
  // Generate placeholder image URL based on cafe name (for demo purposes)
  const imageUrl = `https://via.placeholder.com/${isListView ? '200x200' : '120x120'}/e5e7eb/9ca3af?text=${encodeURIComponent(cafe.name.charAt(0))}`
  
  if (isListView) {
    return (
      <div
        onClick={onClick}
        style={{
          display: 'flex',
          gap: '1.5rem',
          padding: '1.5rem',
          backgroundColor: isSelected ? '#f3f4f6' : '#ffffff',
          borderRadius: '0.5rem',
          border: `1px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: isSelected ? '0 4px 6px rgba(59, 130, 246, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
          marginBottom: '1.5rem',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = '#f9fafb'
            e.currentTarget.style.borderColor = '#d1d5db'
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = '#ffffff'
            e.currentTarget.style.borderColor = '#e5e7eb'
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
          }
        }}
      >
        <img
          src={imageUrl}
          alt={cafe.name}
          style={{
            width: '240px',
            height: '180px',
            objectFit: 'cover',
            borderRadius: '0.5rem',
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              {cafe.name}
            </h3>
            {cafe.isOpenNow !== undefined && (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  backgroundColor: cafe.isOpenNow ? '#10b981' : '#ef4444',
                  color: '#ffffff',
                  fontWeight: 600,
                }}
              >
                {cafe.isOpenNow ? 'Open' : 'Closed'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RatingDisplay rating={cafe.rating} />
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {cafe.tags && cafe.tags.length > 0 ? cafe.tags.join(', ') : 'Cafe, Coffee'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
            📍 {getDisplayAddress(cafe)}
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5 }}>
            {cafe.tags && cafe.tags.length > 0 
              ? `A cozy spot for coffee lovers, offering a wide range of beverages and snacks.`
              : 'Enjoy a variety of coffee blends and light bites.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>
              📏 {formatDistance(cafe.distance)}
            </span>
            <DirectionsButton lat={cafe.lat} lng={cafe.lng} userLocation={userLocation || null} cafe={cafe} />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div
      onClick={onClick}
      style={{
        padding: '1rem',
        marginBottom: '0.75rem',
        backgroundColor: isSelected ? '#1f2937' : '#ffffff',
        borderRadius: '0.5rem',
        border: `1px solid ${isSelected ? '#fbbf24' : '#e5e7eb'}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: isSelected ? '0 4px 6px rgba(251, 191, 36, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = '#f9fafb'
          e.currentTarget.style.borderColor = '#d1d5db'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = '#ffffff'
          e.currentTarget.style.borderColor = '#e5e7eb'
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 600,
            color: isSelected ? '#ffffff' : '#111827',
          }}
        >
          {cafe.name}
        </h3>
        {cafe.isOpenNow !== undefined && (
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              backgroundColor: cafe.isOpenNow ? '#10b981' : '#ef4444',
              color: '#ffffff',
              fontWeight: 600,
            }}
          >
            {cafe.isOpenNow ? 'Open' : 'Closed'}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <RatingDisplay rating={cafe.rating} />
        <span
          style={{
            fontSize: '0.875rem',
            color: isSelected ? '#d1d5db' : '#6b7280',
            fontWeight: 500,
          }}
        >
          📏 {formatDistance(cafe.distance)}
        </span>
      </div>

      <p
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: '0.875rem',
          color: isSelected ? '#d1d5db' : '#6b7280',
          lineHeight: 1.5,
        }}
      >
        📍 {getDisplayAddress(cafe)}
      </p>

      {cafe.tags && cafe.tags.length > 0 ? (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {cafe.tags.map((tag) => (
            <span
              key={tag}
              style={{
                backgroundColor: isSelected ? '#374151' : '#f0f0f0',
                color: isSelected ? '#d1d5db' : '#374151',
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <p
          style={{
            margin: '0 0 0.75rem 0',
            fontSize: '0.75rem',
            color: isSelected ? '#9ca3af' : '#9ca3af',
            fontStyle: 'italic',
          }}
        >
          No amenities listed
        </p>
      )}

      <DirectionsButton lat={cafe.lat} lng={cafe.lng} userLocation={userLocation || null} cafe={cafe} />
    </div>
  )
})

