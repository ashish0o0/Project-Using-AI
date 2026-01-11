export function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function buildNavigationLinks(lat: number, lon: number) {
  return {
    osm: `https://www.openstreetmap.org/directions?to=${lat},${lon}`,
    google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
    apple: `https://maps.apple.com/?daddr=${lat},${lon}`,
  }
}

export function getPrimaryNavigationLink(lat: number, lon: number): string {
  const links = buildNavigationLinks(lat, lon)
  return isMobileDevice() ? links.google : links.osm
}
