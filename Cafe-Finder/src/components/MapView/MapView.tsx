import type { ReactNode } from 'react'

type MapViewProps = {
  children?: ReactNode
}

export function MapView({ children }: MapViewProps) {
  return <main className="map">{children}</main>
}
