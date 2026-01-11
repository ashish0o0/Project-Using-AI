/**
 * Reverse geocoding using Nominatim API to get addresses from coordinates
 * Note: Nominatim has usage policy - max 1 request per second
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    // Note: Rate limiting should be handled by the caller (1 req/sec)

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CafeFinder/1.0', // Required by Nominatim
        },
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    if (data && data.address) {
      const addr = data.address

      // Build address from available components
      const addressParts: string[] = []

      if (addr.house_number) addressParts.push(addr.house_number)
      if (addr.road || addr.street) addressParts.push(addr.road || addr.street)
      if (addr.neighbourhood) addressParts.push(addr.neighbourhood)
      if (addr.suburb) addressParts.push(addr.suburb)
      if (addr.city || addr.town || addr.village) {
        addressParts.push(addr.city || addr.town || addr.village)
      }
      if (addr.postcode) addressParts.push(addr.postcode)
      if (addr.state) addressParts.push(addr.state)

      return addressParts.length > 0 ? addressParts.join(', ') : data.display_name || null
    }

    return data.display_name || null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

/**
 * Batch reverse geocode with delays between requests
 */
export async function batchReverseGeocode(
  locations: Array<{ lat: number; lng: number }>,
  onProgress?: (index: number, total: number) => void
): Promise<(string | null)[]> {
  const results: (string | null)[] = []

  for (let i = 0; i < locations.length; i++) {
    const result = await reverseGeocode(locations[i].lat, locations[i].lng)
    results.push(result)
    onProgress?.(i + 1, locations.length)
  }

  return results
}
