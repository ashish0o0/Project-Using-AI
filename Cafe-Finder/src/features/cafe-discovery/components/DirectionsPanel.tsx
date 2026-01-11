import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
// @ts-ignore - leaflet-routing-machine doesn't have TypeScript definitions
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
// @ts-ignore
import 'leaflet-routing-machine'
import { useCafeDiscoveryStore, type TransportationMode } from '../state/cafeDiscoveryStore'

type DirectionsPanelProps = {
  from: { lat: number; lng: number } | null
  to: { lat: number; lng: number } | null
  destinationAddress?: string
  isOpenNow?: boolean
}

export function DirectionsPanel({ from, to, destinationAddress, isOpenNow }: DirectionsPanelProps) {
  const map = useMap()
  // @ts-ignore
  const routingControlRef = useRef<L.Routing.Control | null>(null)
  const { transportMode } = useCafeDiscoveryStore()

  useEffect(() => {
    if (!from || !to) {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current)
        routingControlRef.current = null
      }
      return
    }

    // Remove existing routing control if any
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current)
    }

    // Get OSRM profile based on transportation mode
    // Note: Public OSRM server may only support 'driving' profile
    // We'll override time calculation manually based on mode-specific speeds
    const getOSRMProfile = (mode: TransportationMode): string => {
      // Use driving profile for all modes since public server may not support others
      // We'll override the time calculation manually
      return 'driving'
    }

    // Calculate time based on distance and transportation mode
    const calculateTimeForMode = (distanceMeters: number, mode: TransportationMode): number => {
      const distanceKm = distanceMeters / 1000
      let speedKmh: number
      
      switch (mode) {
        case 'walk':
          speedKmh = 5 // Average walking speed: 5 km/h
          break
        case 'bike':
          speedKmh = 15 // Average cycling speed: 15 km/h
          break
        case 'car':
        default:
          speedKmh = 50 // Average driving speed: 50 km/h
          break
      }
      
      // Time in hours, convert to seconds
      return (distanceKm / speedKmh) * 3600
    }

    // Format time for display
    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)
      
      if (hours > 0) {
        return `${hours} h ${minutes} min`
      } else if (minutes > 0) {
        return `${minutes} min ${secs > 0 ? `${secs} s` : ''}`
      } else {
        return `${secs} s`
      }
    }

    // Create new routing control
    // @ts-ignore
    const routingControl = L.Routing.control({
      waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
      // @ts-ignore
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: getOSRMProfile(transportMode),
      }),
      routeWhileDragging: false,
      showAlternatives: true, // Enable alternative routes for selection
      lineOptions: {
        styles: [
          {
            color: '#000000',
            opacity: 0.3,
            weight: 11,
          },
          {
            color: '#ffffff',
            opacity: 0.9,
            weight: 9,
          },
          {
            color: '#3b82f6',
            opacity: 1,
            weight: 6,
          },
        ],
      },
      // @ts-ignore
      altLineOptions: {
        styles: [
          {
            color: '#000000',
            opacity: 0.2,
            weight: 9,
          },
          {
            color: '#ffffff',
            opacity: 0.7,
            weight: 6,
          },
          {
            color: '#9333ea',
            opacity: 0.6,
            weight: 4,
          },
        ],
      },
      // @ts-ignore
      createMarker: (i: number, waypoint: any, n: number) => {
        if (i === 0) {
          // User location marker
          return L.marker(waypoint.latLng, {
            icon: L.divIcon({
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
              `,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            }),
          })
        }
        // Destination marker
        return L.marker(waypoint.latLng, {
          icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          }),
        })
      },
    })

    // Ensure map is ready before adding routing control
    const addRoutingControl = () => {
      if (map && map.getContainer()) {
        try {
          routingControl.addTo(map)
          routingControlRef.current = routingControl
        } catch (error) {
          console.error('Error adding routing control:', error)
          // Retry after a short delay if map isn't ready
          setTimeout(() => {
            if (map && map.getContainer() && !routingControlRef.current) {
              try {
                routingControl.addTo(map)
                routingControlRef.current = routingControl
              } catch (retryError) {
                console.error('Error retrying routing control:', retryError)
              }
            }
          }, 200)
        }
      }
    }

    // Try to add immediately, or wait for map to be ready
    if (map && map.getContainer()) {
      addRoutingControl()
    } else {
      // Wait for map to be ready
      const checkMapReady = setInterval(() => {
        if (map && map.getContainer()) {
          clearInterval(checkMapReady)
          addRoutingControl()
        }
      }, 50)
      
      // Clear interval after 2 seconds to prevent infinite loop
      setTimeout(() => clearInterval(checkMapReady), 2000)
    }

    // Add custom CSS for better text visibility and collapsible panel
    const style = document.createElement('style')
    style.setAttribute('data-routing-styles', 'true')
    style.textContent = `
      .leaflet-routing-container {
        background: #ffffff !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        min-width: 280px !important;
        color: #111827 !important;
      }
      .leaflet-routing-container * {
        color: inherit !important;
      }
      .leaflet-routing-container h3 {
        color: #000000 !important;
        font-weight: 700 !important;
        font-size: 1rem !important;
        margin: 0.5rem 0 !important;
      }
      .leaflet-routing-container h4 {
        color: #111827 !important;
        font-weight: 600 !important;
      }
      .leaflet-routing-alt {
        background: #f9fafb !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 6px !important;
        margin: 0.5rem 0 !important;
        padding: 0.75rem !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
      }
      .leaflet-routing-alt:hover {
        background: #f3f4f6 !important;
        border-color: #3b82f6 !important;
      }
      .leaflet-routing-alt-minimized {
        background: #f9fafb !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 6px !important;
        margin: 0.5rem 0 !important;
        padding: 0.5rem !important;
        cursor: pointer !important;
      }
      .leaflet-routing-alt-minimized:hover {
        background: #f3f4f6 !important;
        border-color: #3b82f6 !important;
      }
      .leaflet-routing-alt h4 {
        color: #000000 !important;
        font-weight: 700 !important;
        font-size: 0.875rem !important;
        margin: 0 0 0.5rem 0 !important;
      }
      .leaflet-routing-alt-minimized h4 {
        color: #000000 !important;
        font-weight: 700 !important;
        font-size: 0.875rem !important;
        margin: 0 !important;
      }
      .leaflet-routing-instruction {
        color: #111827 !important;
        font-size: 0.875rem !important;
        line-height: 1.6 !important;
        padding: 0.5rem 0 !important;
        border-bottom: 1px solid #e5e7eb !important;
        font-weight: 400 !important;
      }
      .leaflet-routing-instruction:last-child {
        border-bottom: none !important;
      }
      .leaflet-routing-instruction-icon {
        background-color: #3b82f6 !important;
        color: #ffffff !important;
        border-radius: 4px !important;
        padding: 0.25rem 0.5rem !important;
        margin-right: 0.5rem !important;
        font-weight: 600 !important;
      }
      .leaflet-routing-instruction-distance {
        color: #111827 !important;
        font-weight: 600 !important;
        margin-left: auto !important;
      }
      .leaflet-routing-instruction-text {
        color: #111827 !important;
        font-weight: 400 !important;
      }
      .leaflet-routing-geocoders {
        background: #ffffff !important;
        border-bottom: 1px solid #e5e7eb !important;
        padding: 0.75rem !important;
      }
      .leaflet-routing-geocoders input {
        color: #000000 !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        border: 1px solid #d1d5db !important;
        border-radius: 4px !important;
        padding: 0.5rem !important;
      }
      .leaflet-routing-geocoders label {
        color: #111827 !important;
        font-weight: 600 !important;
      }
      .leaflet-routing-geocoders input:focus {
        border-color: #3b82f6 !important;
        outline: none !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      }
      .leaflet-routing-collapse-btn {
        background: #3b82f6 !important;
        color: #ffffff !important;
        border: none !important;
        border-radius: 4px !important;
        padding: 0.5rem 1rem !important;
        cursor: pointer !important;
        font-weight: 500 !important;
      }
      .leaflet-routing-collapse-btn:hover {
        background: #2563eb !important;
      }
      /* Collapsible panel styles */
      .leaflet-routing-container.collapsed .leaflet-routing-instructions {
        display: none !important;
      }
      .leaflet-routing-container.collapsed .leaflet-routing-alt {
        display: none !important;
      }
      .leaflet-routing-container.collapsed .leaflet-routing-geocoders {
        display: none !important;
      }
      .leaflet-routing-container.collapsed .leaflet-routing-container-hide {
        display: none !important;
      }
      .leaflet-routing-container.collapsed {
        min-width: 200px !important;
        max-width: 350px !important;
        height: auto !important;
        overflow: visible !important;
      }
      .custom-collapse-header {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        padding: 0.75rem 1rem !important;
        border-bottom: 2px solid #000000 !important;
        cursor: pointer !important;
        background: #ffffff !important;
        border-radius: 8px 8px 0 0 !important;
      }
      .custom-collapse-header:hover {
        background: #f9fafb !important;
      }
      .custom-collapse-content {
        display: flex !important;
        flex-direction: column !important;
        gap: 0.5rem !important;
        flex: 1 !important;
        margin-right: 0.5rem !important;
      }
      .custom-collapse-address {
        color: #111827 !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        line-height: 1.4 !important;
      }
      .cafe-status-badge {
        display: inline-block !important;
        font-size: 0.75rem !important;
        padding: 0.25rem 0.5rem !important;
        border-radius: 0.25rem !important;
        font-weight: 600 !important;
        width: fit-content !important;
      }
      .cafe-status-badge.open {
        background-color: #10b981 !important;
        color: #ffffff !important;
      }
      .cafe-status-badge.closed {
        background-color: #ef4444 !important;
        color: #ffffff !important;
      }
      .custom-collapse-toggle {
        background: transparent !important;
        border: none !important;
        color: #6b7280 !important;
        font-size: 1rem !important;
        cursor: pointer !important;
        padding: 0.25rem 0.5rem !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 24px !important;
        height: 24px !important;
      }
      .custom-collapse-toggle:hover {
        color: #111827 !important;
      }
      /* Hide minimized alternative routes - show only when expanded */
      .leaflet-routing-alt-minimized {
        display: none !important;
      }
      /* Show alternative routes only when not collapsed and allow selection */
      .leaflet-routing-alt {
        display: block !important;
      }
      .leaflet-routing-container.collapsed .leaflet-routing-alt {
        display: none !important;
      }
    `
    document.head.appendChild(style)

    // Override time calculation based on transport mode
    const overrideRouteTime = (routes: any[]) => {
      routes.forEach((route) => {
        if (route.summary && route.summary.totalDistance) {
          // Calculate correct time based on transport mode
          const correctTimeSeconds = calculateTimeForMode(route.summary.totalDistance, transportMode)
          
          // Override the duration in route summary
          route.summary.totalTime = correctTimeSeconds
        }
      })
      
      // Update displayed time in the UI after DOM is ready
      setTimeout(() => {
        const container = document.querySelector('.leaflet-routing-container')
        if (!container) return
        
        // Find route summary headers (h3 elements showing distance and time)
        const routeHeaders = container.querySelectorAll('h3')
        routeHeaders.forEach((header) => {
          const text = header.textContent || ''
          // Match pattern like "1.5 km, 3 min" or "2.0 km, 5 min 30 s"
          const match = text.match(/([\d.]+)\s*(km|m)\s*,\s*([\d\s]+(?:min|h|s)?)/i)
          if (match) {
            const distanceStr = match[1]
            const unit = match[2].toLowerCase()
            const distanceMeters = unit === 'km' ? parseFloat(distanceStr) * 1000 : parseFloat(distanceStr)
            
            const correctTimeSeconds = calculateTimeForMode(distanceMeters, transportMode)
            const formattedTime = formatTime(correctTimeSeconds)
            const formattedDistance = unit === 'km' ? `${distanceStr} km` : `${distanceStr}m`
            
            // Update the header text
            header.textContent = `${formattedDistance}, ${formattedTime}`
          }
        })
        
        // Update alternative route summaries
        const altRoutes = container.querySelectorAll('.leaflet-routing-alt h4')
        altRoutes.forEach((altHeader) => {
          const text = altHeader.textContent || ''
          const match = text.match(/([\d.]+)\s*(km|m)\s*,\s*([\d\s]+(?:min|h|s)?)/i)
          if (match) {
            const distanceStr = match[1]
            const unit = match[2].toLowerCase()
            const distanceMeters = unit === 'km' ? parseFloat(distanceStr) * 1000 : parseFloat(distanceStr)
            
            const correctTimeSeconds = calculateTimeForMode(distanceMeters, transportMode)
            const formattedTime = formatTime(correctTimeSeconds)
            const formattedDistance = unit === 'km' ? `${distanceStr} km` : `${distanceStr}m`
            
            altHeader.textContent = `${formattedDistance}, ${formattedTime}`
          }
        })
      }, 500)
    }

    // Add collapsible functionality
    let isCollapsed = false
    let displayAddress = destinationAddress || ''
    let collapseHeader: HTMLDivElement | null = null

    // Function to update collapse header
    const updateCollapseHeader = (address: string) => {
      if (collapseHeader) {
        const addressDiv = collapseHeader.querySelector('.custom-collapse-address')
        if (addressDiv) {
          addressDiv.textContent = address
        }
        
        // Update status badge if needed
        const statusBadge = collapseHeader.querySelector('.cafe-status-badge')
        if (statusBadge && isOpenNow !== undefined) {
          statusBadge.textContent = isOpenNow ? 'Open' : 'Closed'
          statusBadge.className = `cafe-status-badge ${isOpenNow ? 'open' : 'closed'}`
        } else if (!statusBadge && isOpenNow !== undefined) {
          // Create status badge if it doesn't exist
          const contentDiv = collapseHeader.querySelector('.custom-collapse-content')
          if (contentDiv) {
            const badge = document.createElement('span')
            badge.className = `cafe-status-badge ${isOpenNow ? 'open' : 'closed'}`
            badge.textContent = isOpenNow ? 'Open' : 'Closed'
            contentDiv.appendChild(badge)
          }
        }
      }
    }

    // Function to setup collapse functionality
    const setupCollapse = (address: string) => {
      const container = document.querySelector('.leaflet-routing-container')
      if (!container) return

      // Remove existing header if any
      const existingHeader = container.querySelector('.custom-collapse-header')
      if (existingHeader) {
        existingHeader.remove()
      }

      // Find the first route instructions container
      const instructionsContainer = container.querySelector('.leaflet-routing-instructions')
      const geocoders = container.querySelector('.leaflet-routing-geocoders')
      const firstChild = container.firstElementChild
      
      if (instructionsContainer || geocoders || firstChild) {
        collapseHeader = document.createElement('div')
        collapseHeader.className = 'custom-collapse-header'
        
        // Create status badge if available
        const statusBadge = isOpenNow !== undefined 
          ? `<span class="cafe-status-badge ${isOpenNow ? 'open' : 'closed'}">${isOpenNow ? 'Open' : 'Closed'}</span>`
          : ''
        
        collapseHeader.innerHTML = `
          <div class="custom-collapse-content">
            <div class="custom-collapse-address">${address}</div>
            ${statusBadge}
          </div>
          <button class="custom-collapse-toggle" title="Show directions">▼</button>
        `
        
        const toggleBtn = collapseHeader.querySelector('.custom-collapse-toggle')
        toggleBtn?.addEventListener('click', (e) => {
          e.stopPropagation()
          isCollapsed = !isCollapsed
          if (isCollapsed) {
            // Collapsed: show only address
            container.classList.add('collapsed')
            toggleBtn.textContent = '▼'
            toggleBtn.title = 'Show directions'
          } else {
            // Expanded: show full directions
            container.classList.remove('collapsed')
            toggleBtn.textContent = '▲'
            toggleBtn.title = 'Hide directions'
          }
        })

        // Insert at the beginning
        container.insertBefore(collapseHeader, container.firstChild)
        
        // Start collapsed (showing only address) - matches the 4th image
        isCollapsed = true
        container.classList.add('collapsed')
        
        // Ensure only the active route instructions are visible
        setTimeout(() => {
          const allInstructions = container.querySelectorAll('.leaflet-routing-instructions')
          if (allInstructions.length > 1) {
            // Hide all but the first (active) one
            allInstructions.forEach((inst, index) => {
              if (index > 0) {
                (inst as HTMLElement).style.display = 'none'
              }
            })
          }
        }, 100)
      }
    }

    // Get destination address when route is found
    routingControl.on('routesfound', (e) => {
      const routes = e.routes
      if (routes && routes.length > 0) {
        // Override time calculation for all routes based on transport mode
        overrideRouteTime(routes)
        
        const route = routes[0]
        
        // Use provided address, or try to extract from route instructions
        if (!displayAddress) {
          if (route.instructions && route.instructions.length > 0) {
            // Try to extract road names from multiple instructions
            const roadNames: string[] = []
            route.instructions.forEach((inst: any) => {
              if (inst.text) {
                const match = inst.text.match(/onto\s+([^,]+)/i) || 
                             inst.text.match(/on\s+([^,]+)/i) ||
                             inst.text.match(/([A-Za-z\s]+Road|[A-Za-z\s]+Street|[A-Za-z\s]+Avenue|[A-Za-z\s]+Marg)/i)
                if (match && match[1]) {
                  const road = match[1].trim()
                  if (!roadNames.includes(road)) {
                    roadNames.push(road)
                  }
                }
              }
            })
            
            if (roadNames.length > 0) {
              displayAddress = roadNames.join(', ')
            } else {
              const lastInstruction = route.instructions[route.instructions.length - 1]
              if (lastInstruction.text) {
                displayAddress = lastInstruction.text.replace(/You have arrived.*/i, '').trim()
              }
            }
          }
          
          // If still no address found, use coordinates
          if (!displayAddress) {
            displayAddress = `${to.lat.toFixed(6)}, ${to.lng.toFixed(6)}`
          }
        }

        // Setup collapse after DOM is ready
        setTimeout(() => {
          setupCollapse(displayAddress)
        }, 300)
        
        // Fit map to show the entire route
        const bounds = routes[0].coordinates.reduce(
          (bounds, coord) => bounds.extend(coord),
          L.latLngBounds([from.lat, from.lng], [to.lat, to.lng])
        )
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    })

    // Handle route selection - when user clicks on alternative route
    routingControl.on('routeselected', (e) => {
      const route = e.route
      if (route && route.instructions) {
        // Override time for selected route
        if (route.summary && route.summary.totalDistance) {
          const correctTimeSeconds = calculateTimeForMode(route.summary.totalDistance, transportMode)
          route.summary.totalTime = correctTimeSeconds
        }
        
        // Extract address from selected route
        const roadNames: string[] = []
        route.instructions.forEach((inst: any) => {
          if (inst.text) {
            const match = inst.text.match(/onto\s+([^,]+)/i) || 
                         inst.text.match(/on\s+([^,]+)/i) ||
                         inst.text.match(/([A-Za-z\s]+Road|[A-Za-z\s]+Street|[A-Za-z\s]+Avenue|[A-Za-z\s]+Marg)/i)
            if (match && match[1]) {
              const road = match[1].trim()
              if (!roadNames.includes(road)) {
                roadNames.push(road)
              }
            }
          }
        })
        
        if (roadNames.length > 0) {
          displayAddress = roadNames.join(', ')
          updateCollapseHeader(displayAddress)
        }
        
        // Update displayed time in UI
        setTimeout(() => {
          overrideRouteTime([route])
        }, 100)
      }
    })

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current)
        routingControlRef.current = null
      }
      // Clean up style element
      const styleElement = document.querySelector('style[data-routing-styles]')
      if (styleElement) {
        styleElement.remove()
      }
    }
  }, [map, from, to, transportMode, isOpenNow])

  return null
}
