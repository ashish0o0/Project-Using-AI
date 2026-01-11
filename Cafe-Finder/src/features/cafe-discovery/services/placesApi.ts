import type { Cafe } from '../types'
import { reverseGeocode } from '../../../utils/geocoding'
import { parseOpeningHours } from '../../../utils/openingHours'

type OverpassElement = {
  id: number
  lat: number
  lon: number
  tags?: {
    name?: string
    amenity?: string
    'addr:full'?: string
    'addr:street'?: string
    'addr:housenumber'?: string
    'addr:city'?: string
    'addr:postcode'?: string
    'opening_hours'?: string
    wifi?: string
    takeaway?: string
    'outdoor_seating'?: string
    internet_access?: string
    wheelchair?: string
    smoking?: string
  }
}

type OverpassResponse = {
  elements: OverpassElement[]
}

export async function fetchNearbyCafes(lat: number, lng: number, radiusMeters = 1000): Promise<Cafe[]> {
  const query = `
    [out:json];
    (
      node["amenity"="cafe"](around:${radiusMeters},${lat},${lng});
      way["amenity"="cafe"](around:${radiusMeters},${lat},${lng});
      relation["amenity"="cafe"](around:${radiusMeters},${lat},${lng});
    );
    out center meta;
  `

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.statusText}`)
    }

    const data: OverpassResponse = await response.json()

    // First, extract basic cafe data
    const cafes = data.elements
      .map((element) => {
        const elementLat = element.lat || (element as any).center?.lat
        const elementLng = element.lon || (element as any).center?.lon

        if (!elementLat || !elementLng) {
          return null
        }

        const name = element.tags?.name || 'Unnamed Cafe'
        const addressParts = [
          element.tags?.['addr:housenumber'],
          element.tags?.['addr:street'],
          element.tags?.['addr:city'],
        ].filter(Boolean)

        const tags: string[] = []
        if (element.tags?.wifi === 'yes' || element.tags?.internet_access === 'wlan') {
          tags.push('WiFi')
        }
        if (element.tags?.takeaway === 'yes') {
          tags.push('Takeaway')
        }
        if (element.tags?.['outdoor_seating'] === 'yes') {
          tags.push('Outdoor Seating')
        }
        if (element.tags?.wheelchair === 'yes') {
          tags.push('Wheelchair Accessible')
        }
        if (element.tags?.smoking === 'yes') {
          tags.push('Smoking Allowed')
        }

        // Parse opening hours to determine if cafe is open
        const openingHours = element.tags?.['opening_hours']
        const isOpenNow = parseOpeningHours(openingHours)

        return {
          id: `osm-${element.id}`,
          name,
          address: element.tags?.['addr:full'] || addressParts.join(' ') || undefined,
          addressDetails: {
            street: element.tags?.['addr:street'],
            city: element.tags?.['addr:city'],
            postcode: element.tags?.['addr:postcode'],
          },
          lat: elementLat,
          lng: elementLng,
          tags: tags.length > 0 ? tags : undefined,
          isOpenNow: isOpenNow !== null ? isOpenNow : undefined,
        } as Cafe
      })
      .filter((cafe): cafe is Cafe => cafe !== null)

    // Enhance with reverse geocoding for cafes without addresses
    // Prioritize cafes with partial addresses, then others
    // Increase limit based on total cafes to ensure more addresses are fetched
    const maxGeocodeLimit = Math.min(cafes.length, 30) // Fetch addresses for up to 30 cafes
    
    const cafesWithoutAddress = cafes
      .map((cafe, index) => ({ 
        cafe, 
        index, 
        hasPartialAddress: !!cafe.addressDetails?.street || !!cafe.addressDetails?.city 
      }))
      .filter(({ cafe }) => !cafe.address)
      .sort((a, b) => {
        // Prioritize cafes with partial address info
        if (a.hasPartialAddress && !b.hasPartialAddress) return -1
        if (!a.hasPartialAddress && b.hasPartialAddress) return 1
        return a.index - b.index
      })
      .slice(0, maxGeocodeLimit)
      .map(({ cafe }) => cafe)

    // Process geocoding sequentially with rate limiting (1 req/sec for Nominatim)
    // Process sequentially to respect rate limits properly
    for (let i = 0; i < cafesWithoutAddress.length; i++) {
      const cafe = cafesWithoutAddress[i]
      // Add delay to respect Nominatim's 1 req/sec rate limit (except for first request)
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      try {
        const address = await reverseGeocode(cafe.lat, cafe.lng)
        if (address) {
          cafe.address = address
        }
      } catch (error) {
        console.error(`Failed to geocode cafe ${cafe.id}:`, error)
      }
    }

    return cafes
  } catch (error) {
    console.error('Error fetching cafes from Overpass API:', error)
    throw error
  }
}

