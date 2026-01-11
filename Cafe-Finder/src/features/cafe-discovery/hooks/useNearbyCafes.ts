import { useQuery } from '@tanstack/react-query'
import { fetchNearbyCafes } from '../services/placesApi'
import type { Cafe } from '../types'

type UseNearbyCafesParams = {
  lat: number | null
  lng: number | null
  radiusMeters?: number
  enabled?: boolean
}

export function useNearbyCafes({ lat, lng, radiusMeters = 1000, enabled = true }: UseNearbyCafesParams) {
  const {
    data: cafes = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Cafe[]>({
    queryKey: ['nearbyCafes', lat, lng, radiusMeters],
    queryFn: () => {
      if (!lat || !lng) {
        throw new Error('Location is required')
      }
      return fetchNearbyCafes(lat, lng, radiusMeters)
    },
    enabled: enabled && lat !== null && lng !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  })

  return { cafes, isLoading, error, refetch }
}

