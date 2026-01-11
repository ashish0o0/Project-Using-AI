/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth radius in meters
  const toRad = (value: number) => (value * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 * @deprecated Use calculateDistance and divide by 1000 if needed
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return calculateDistance(lat1, lon1, lat2, lon2) / 1000
}

export function formatDistance(meters: number | undefined): string {
  if (meters == null) return 'Distance unavailable'
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

export function formatAddress(addressDetails?: { street?: string; city?: string; postcode?: string }): string {
  if (!addressDetails) return 'Address unavailable'
  const parts = [addressDetails.street, addressDetails.city, addressDetails.postcode].filter(Boolean)
  if (parts.length > 0) {
    return parts.join(', ')
  }
  return 'Address unavailable'
}

export function getDisplayAddress(cafe: { address?: string; addressDetails?: { street?: string; city?: string; postcode?: string } }): string {
  if (cafe.address) {
    return cafe.address
  }
  if (cafe.addressDetails) {
    const formatted = formatAddress(cafe.addressDetails)
    if (formatted !== 'Address unavailable') {
      return formatted
    }
  }
  return 'Address unavailable'
}
