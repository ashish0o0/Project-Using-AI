export type Cafe = {
  id: string
  name: string
  rating?: number
  address?: string
  addressDetails?: {
    street?: string
    city?: string
    postcode?: string
  }
  isOpenNow?: boolean
  lat: number
  lng: number
  distance?: number
  tags?: string[]
}

