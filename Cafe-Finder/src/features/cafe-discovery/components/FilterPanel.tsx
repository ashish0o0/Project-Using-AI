import { memo } from 'react'
import { useCafeDiscoveryStore, type TransportationMode } from '../state/cafeDiscoveryStore'

type FilterPanelProps = {
  radius?: number
  onRadiusChange?: (radius: number) => void
  showSlider?: boolean
}

export const FilterPanel = memo(function FilterPanel({
  radius = 1000,
  onRadiusChange,
  showSlider = true,
}: FilterPanelProps) {
  const { transportMode, setTransportMode } = useCafeDiscoveryStore()
  
  const radiusOptions = [
    { label: '500m', value: 500 },
    { label: '1km', value: 1000 },
    { label: '2km', value: 2000 },
    { label: '5km', value: 5000 },
  ]

  const transportModes: Array<{ mode: TransportationMode; label: string; icon: string }> = [
    { mode: 'walk', label: 'Walk', icon: '🚶' },
    { mode: 'bike', label: 'Bike', icon: '🚴' },
    { mode: 'car', label: 'Car', icon: '🚗' },
  ]

  const radiusKm = radius / 1000

  return (
    <div
      style={{
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
        marginRight: '1.5rem',
        marginBottom: '1.5rem',
      }}
    >
      <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
        Filter by Distance
      </h4>

      {/* Transportation Mode Selection */}
      <div style={{ marginBottom: '1rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            color: '#374151',
            marginBottom: '0.5rem',
            fontWeight: 500,
          }}
        >
          Transportation Mode
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {transportModes.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setTransportMode(mode)}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                border: `1px solid ${transportMode === mode ? '#3b82f6' : '#d1d5db'}`,
                backgroundColor: transportMode === mode ? '#3b82f6' : '#ffffff',
                color: transportMode === mode ? '#ffffff' : '#374151',
                fontSize: '0.875rem',
                fontWeight: transportMode === mode ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
              }}
              onMouseEnter={(e) => {
                if (transportMode !== mode) {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                  e.currentTarget.style.borderColor = '#9ca3af'
                }
              }}
              onMouseLeave={(e) => {
                if (transportMode !== mode) {
                  e.currentTarget.style.backgroundColor = '#ffffff'
                  e.currentTarget.style.borderColor = '#d1d5db'
                }
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {showSlider && (
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#374151',
              marginBottom: '0.5rem',
              fontWeight: 500,
            }}
          >
            Radius: <strong style={{ color: '#fbbf24' }}>{radiusKm.toFixed(1)} km</strong>
          </label>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={radiusKm}
            onChange={(e) => onRadiusChange?.(Number(e.target.value) * 1000)}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${((radiusKm - 0.5) / 9.5) * 100}%, #e5e7eb ${((radiusKm - 0.5) / 9.5) * 100}%, #e5e7eb 100%)`,
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
            onMouseMove={(e) => {
              const target = e.target as HTMLInputElement
              const value = Number(target.value)
              target.style.background = `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${((value - 0.5) / 9.5) * 100}%, #e5e7eb ${((value - 0.5) / 9.5) * 100}%, #e5e7eb 100%)`
            }}
          />
          <style>
            {`
              input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #fbbf24;
                cursor: pointer;
                border: 2px solid #ffffff;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
              input[type="range"]::-moz-range-thumb {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #fbbf24;
                cursor: pointer;
                border: 2px solid #ffffff;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
            `}
          </style>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            <span>0.5km</span>
            <span>10km</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {radiusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onRadiusChange?.(option.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: `1px solid ${radius === option.value ? '#fbbf24' : '#d1d5db'}`,
              backgroundColor: radius === option.value ? '#fef3c7' : '#ffffff',
              color: radius === option.value ? '#92400e' : '#374151',
              fontSize: '0.875rem',
              fontWeight: radius === option.value ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (radius !== option.value) {
                e.currentTarget.style.borderColor = '#9ca3af'
                e.currentTarget.style.backgroundColor = '#f9fafb'
              }
            }}
            onMouseLeave={(e) => {
              if (radius !== option.value) {
                e.currentTarget.style.borderColor = '#d1d5db'
                e.currentTarget.style.backgroundColor = '#ffffff'
              }
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
})

