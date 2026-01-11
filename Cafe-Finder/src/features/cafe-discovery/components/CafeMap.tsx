import { useEffect, useMemo, memo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Cafe } from '../types'
import { DirectionsPanel } from './DirectionsPanel'
import { useCafeDiscoveryStore } from '../state/cafeDiscoveryStore'

import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

type MapInitializerProps = {
  userLocation: { lat: number; lng: number } | null
}

function MapInitializer({ userLocation }: MapInitializerProps) {
  const map = useMap()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (userLocation && !initializedRef.current) {
      map.setView([userLocation.lat, userLocation.lng], 15)
      initializedRef.current = true
    }
  }, [map, userLocation])

  return null
}

type FlyToCafeProps = {
  cafe: Cafe | null
}

function FlyToCafe({ cafe }: FlyToCafeProps) {
  const map = useMap()

  useEffect(() => {
    if (cafe) {
      map.flyTo([cafe.lat, cafe.lng], 17, {
        duration: 0.6,
      })
    }
  }, [cafe, map])

  return null
}

type CafeMapProps = {
  userLocation: { lat: number; lng: number } | null
  cafes: Cafe[]
  selectedCafeId?: string | null
  selectedCafe?: Cafe | null
  onCafeClick?: (cafe: Cafe) => void
}

const cafeIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const selectedCafeIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  popupAnchor: [1, -34],
})

// Custom user location icon - blue dot with translucent ring (created once for performance)
const userIcon = L.divIcon({
  className: 'user-location-icon',
  html: `
    <div style="
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: rgba(59, 130, 246, 0.2);
        border: 2px solid rgba(59, 130, 246, 0.3);
        animation: pulse 2s infinite;
      "></div>
      <div style="
        position: absolute;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: #3b82f6;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        z-index: 1;
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 0.6;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.3;
        }
        100% {
          transform: scale(1);
          opacity: 0.6;
        }
      }
    </style>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
})

type CafeMarkerProps = {
  cafe: Cafe
  isSelected: boolean
  onCafeClick?: (cafe: Cafe) => void
}

const CafeMarker = memo(function CafeMarker({ cafe, isSelected, onCafeClick }: CafeMarkerProps) {
  return (
    <Marker
      position={[cafe.lat, cafe.lng]}
      icon={isSelected ? selectedCafeIcon : cafeIcon}
      eventHandlers={{
        click: () => {
          onCafeClick?.(cafe)
        },
      }}
    >
      <Popup>
        <div>
          <strong>{cafe.name}</strong>
          {cafe.address && <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>{cafe.address}</p>}
          {cafe.rating && <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>⭐ {cafe.rating}</p>}
        </div>
      </Popup>
    </Marker>
  )
})

export const CafeMap = memo(function CafeMap({
  userLocation,
  cafes,
  selectedCafeId,
  selectedCafe,
  onCafeClick,
}: CafeMapProps) {
  const defaultCenter: [number, number] = [28.6139, 77.209]
  const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter
  const { showDirections, directionsTo, directionsAddress, directionsCafeStatus } = useCafeDiscoveryStore()

  const markers = useMemo(
    () =>
      cafes.map((cafe) => (
        <CafeMarker
          key={cafe.id}
          cafe={cafe}
          isSelected={selectedCafeId === cafe.id}
          onCafeClick={onCafeClick}
        />
      )),
    [cafes, selectedCafeId, onCafeClick]
  )

  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapInitializer userLocation={userLocation} />
      <FlyToCafe cafe={selectedCafe || null} />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Your Location</Popup>
        </Marker>
      )}

      {markers}

      {showDirections && directionsTo && userLocation && (
        <DirectionsPanel 
          from={userLocation} 
          to={directionsTo} 
          destinationAddress={directionsAddress || undefined}
          isOpenNow={directionsCafeStatus}
        />
      )}
    </MapContainer>
  )
})
