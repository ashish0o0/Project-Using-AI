import { create } from 'zustand'

export type TransportationMode = 'walk' | 'bike' | 'car'

type CafeDiscoveryState = {
  selectedCafeId: string | null
  showDirections: boolean
  directionsTo: { lat: number; lng: number } | null
  directionsAddress: string | null
  directionsCafeStatus: boolean | undefined // isOpenNow status
  transportMode: TransportationMode
}

type CafeDiscoveryActions = {
  selectCafe: (id: string | null) => void
  showDirectionsTo: (lat: number, lng: number, address?: string, isOpenNow?: boolean) => void
  hideDirections: () => void
  setTransportMode: (mode: TransportationMode) => void
}

type CafeDiscoveryStore = CafeDiscoveryState & CafeDiscoveryActions

export const useCafeDiscoveryStore = create<CafeDiscoveryStore>((set) => ({
  selectedCafeId: null,
  showDirections: false,
  directionsTo: null,
  directionsAddress: null,
  directionsCafeStatus: undefined,
  transportMode: 'car',
  selectCafe: (id) => set({ selectedCafeId: id }),
  showDirectionsTo: (lat, lng, address, isOpenNow) =>
    set({ 
      showDirections: true, 
      directionsTo: { lat, lng }, 
      directionsAddress: address || null,
      directionsCafeStatus: isOpenNow,
    }),
  hideDirections: () => set({ 
    showDirections: false, 
    directionsTo: null, 
    directionsAddress: null,
    directionsCafeStatus: undefined,
  }),
  setTransportMode: (mode) => set({ transportMode: mode }),
}))

