import { useState, useMemo, useCallback, Suspense, lazy } from 'react'
import { Header } from '../../components/Header/Header'
import { Sidebar } from '../../components/Sidebar/Sidebar'
import { MapView } from '../../components/MapView/MapView'
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner'
import { useGeolocation } from '../../hooks/useGeolocation'
import { useDebounce } from '../../hooks/useDebounce'
import { useNearbyCafes } from './hooks/useNearbyCafes'
import { useCafeDiscoveryStore } from './state/cafeDiscoveryStore'
import { calculateDistance } from '../../utils/distance'
import { SearchBar } from './components/SearchBar'
import { CafeList } from './components/CafeList'
import { FilterPanel } from './components/FilterPanel'
import type { Cafe } from './types'
import '../../styles/layout.css'
import '../../styles/global.css'

const CafeMap = lazy(() =>
  import('./components/CafeMap').then((module) => ({
    default: module.CafeMap,
  }))
)

export function CafeDiscoveryPage() {
  const { location, error: locationError, loading: locationLoading, refetch: refetchLocation } = useGeolocation()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [radiusMeters, setRadiusMeters] = useState(1000)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const { selectedCafeId, selectCafe } = useCafeDiscoveryStore()

  const { cafes, isLoading: cafesLoading, error: cafesError } = useNearbyCafes({
    lat: location?.lat ?? null,
    lng: location?.lng ?? null,
    radiusMeters,
    enabled: !locationLoading && location !== null,
  })

  const cafesWithDistance = useMemo(() => {
    if (!location) return cafes

    return cafes.map((cafe) => ({
      ...cafe,
      distance: calculateDistance(location.lat, location.lng, cafe.lat, cafe.lng),
    }))
  }, [cafes, location])

  const filteredCafes = useMemo(() => {
    if (!location) return []

    // Filter by distance (already calculated in cafesWithDistance)
    let result = cafesWithDistance.filter((cafe) => {
      return cafe.distance !== undefined && cafe.distance <= radiusMeters
    })

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase()
      result = result.filter(
        (cafe) =>
          cafe.name.toLowerCase().includes(query) ||
          cafe.address?.toLowerCase().includes(query)
      )
    }

    // Sort by distance (nearest first)
    return result.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance
      }
      return 0
    })
  }, [cafesWithDistance, radiusMeters, debouncedSearchQuery])

  const selectedCafe = useMemo(() => {
    return filteredCafes.find((cafe) => cafe.id === selectedCafeId) || null
  }, [filteredCafes, selectedCafeId])

  const handleCafeClick = useCallback(
    (cafe: Cafe) => {
      selectCafe(cafe.id)
    },
    [selectCafe]
  )

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  const handleSearch = useCallback(() => {
    // Search is automatically handled by debouncedSearchQuery
    // This handler is available for future explicit search functionality
  }, [])

  const handleRadiusChange = useCallback((radius: number) => {
    setRadiusMeters(radius)
  }, [])

  if (locationLoading) {
    return (
      <div className="app-container">
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <LoadingSpinner size="large" />
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>📍 Getting your location...</p>
          </div>
        </div>
      </div>
    )
  }

  if (locationError) {
    return (
      <div className="app-container">
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#ef4444', marginBottom: '1rem' }}>❌ {locationError}</p>
            {locationError === 'Location permission denied' && (
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Please enable location access to find nearby cafés.
              </p>
            )}
            <button
              onClick={refetchLocation}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #4b5563',
                backgroundColor: '#3b2f2f',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Header>
        <SearchBar value={searchQuery} onChange={handleSearchChange} onSearch={handleSearch} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
              color: viewMode === 'list' ? '#3b2f2f' : '#ffffff',
              border: '1px solid #ffffff',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            📋 List
          </button>
          <button
            onClick={() => setViewMode('map')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: viewMode === 'map' ? '#ffffff' : 'transparent',
              color: viewMode === 'map' ? '#3b2f2f' : '#ffffff',
              border: '1px solid #ffffff',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            🗺️ Map
          </button>
        </div>
      </Header>
      {viewMode === 'list' ? (
        <div className="list-view-container">
          <div className="list-view-sidebar">
            <div className="filter-panel-wrapper">
              <FilterPanel radius={radiusMeters} onRadiusChange={handleRadiusChange} />
            </div>
          </div>
          <div className="list-view-main">
            <div className="list-view-content">
              {cafesLoading ? (
                <div className="loading-container">
                  <div className="list-view-header loading-header">
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#111827' }}>
                        Cafés Near You
                      </h2>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                        Finding places...
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
                    <LoadingSpinner size="large" />
                  </div>
                </div>
              ) : cafesError ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', fontSize: '0.875rem' }}>
                  Error loading cafés: {cafesError instanceof Error ? cafesError.message : 'Unknown error'}
                </div>
              ) : filteredCafes.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#111827', fontSize: '1rem', fontWeight: 700 }}>
                    No cafés found. Try adjusting your search or filters.
                  </p>
                </div>
              ) : (
                <>
                  <div className="list-view-header">
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#111827' }}>
                        Cafés Near You
                      </h2>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                        {filteredCafes.length}+ places
                      </p>
                    </div>
                  </div>
                  <CafeList
                    cafes={filteredCafes}
                    selectedCafeId={selectedCafeId}
                    onCafeClick={handleCafeClick}
                    userLocation={location}
                    viewMode="list"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="content">
          <Sidebar>
            <FilterPanel radius={radiusMeters} onRadiusChange={handleRadiusChange} />
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
                Nearby Cafés {filteredCafes.length > 0 && `(${filteredCafes.length})`}
              </h3>
              {cafesLoading ? (
                <LoadingSpinner size="medium" />
              ) : cafesError ? (
                <div style={{ padding: '1rem', color: '#ef4444', fontSize: '0.875rem' }}>
                  Error loading cafés: {cafesError instanceof Error ? cafesError.message : 'Unknown error'}
                </div>
              ) : (
                <CafeList
                  cafes={filteredCafes}
                  selectedCafeId={selectedCafeId}
                  onCafeClick={handleCafeClick}
                  userLocation={location}
                  viewMode="sidebar"
                />
              )}
            </div>
          </Sidebar>
          <MapView>
            <Suspense fallback={<LoadingSpinner size="large" />}>
              <CafeMap
                userLocation={location}
                cafes={filteredCafes}
                selectedCafeId={selectedCafeId}
                selectedCafe={selectedCafe}
                onCafeClick={handleCafeClick}
              />
            </Suspense>
          </MapView>
        </div>
      )}
    </div>
  )
}


