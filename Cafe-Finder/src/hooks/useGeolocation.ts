import { useEffect, useState, useCallback } from 'react'

type Location = {
  lat: number
  lng: number
}

type UseGeolocationReturn = {
  location: Location | null
  error: string | null
  loading: boolean
  refetch: () => void
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLoading(false)
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Location information unavailable')
            break
          case err.TIMEOUT:
            setError('Location request timed out')
            break
          default:
            setError('An unknown error occurred')
        }
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [])

  useEffect(() => {
    fetchLocation()
  }, [fetchLocation])

  return { location, error, loading, refetch: fetchLocation }
}
