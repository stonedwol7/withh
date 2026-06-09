'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Crosshair, Loader2 } from 'lucide-react'

interface LocationPickerProps {
  meetingLocation: string
  destination: string
  onMeetingLocationChange: (val: string) => void
  onDestinationChange: (val: string) => void
}

export function LocationPicker({
  meetingLocation,
  destination,
  onMeetingLocationChange,
  onDestinationChange,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const marker1 = useRef<any>(null)
  const marker2 = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [center, setCenter] = useState<[number, number]>([12.9716, 77.5946])
  const M = useRef<any>(null)

  useEffect(() => {
    const initMap = async () => {
      if (typeof window === 'undefined' || mapInstance.current) return
      try {
        const L = (await import('leaflet')).default
        M.current = L

        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        if (!mapRef.current) return
        const map = L.map(mapRef.current, {
          center,
          zoom: 13,
          zoomControl: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map)

        const m1 = L.marker(center, { draggable: true }).addTo(map)
          .bindPopup('Meeting location')
        const m2 = L.marker([center[0] + 0.01, center[1] + 0.01], { draggable: true }).addTo(map)
          .bindPopup('Destination')

        m1.on('dragend', () => {
          const pos = m1.getLatLng()
          reverseGeocode(pos.lat, pos.lng, (addr) => onMeetingLocationChange(addr))
        })
        m2.on('dragend', () => {
          const pos = m2.getLatLng()
          reverseGeocode(pos.lat, pos.lng, (addr) => onDestinationChange(addr))
        })

        map.on('click', (e: any) => {
          if (!meetingLocation) {
            m1.setLatLng(e.latlng)
            onMeetingLocationChange(`${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`)
          } else if (!destination) {
            m2.setLatLng(e.latlng)
            onDestinationChange(`${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`)
          }
        })

        mapInstance.current = map
        marker1.current = m1
        marker2.current = m2
        setMapReady(true)
      } catch {}
    }

    initMap()
    return () => { mapInstance.current?.remove(); mapInstance.current = null }
  }, [])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCenter([lat, lng])
        mapInstance.current?.setView([lat, lng], 15)
        marker1.current?.setLatLng([lat, lng])
        reverseGeocode(lat, lng, (addr) => onMeetingLocationChange(addr))
        setGeoLoading(false)
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const showOnMap = (address: string, marker: any) => {
    if (!address || address.includes(',')) {
      const parts = address.split(',').map(s => parseFloat(s.trim()))
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        marker?.setLatLng(parts)
        mapInstance.current?.setView(parts, 15)
      }
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Meeting Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
          <input
            value={meetingLocation}
            onChange={(e) => { onMeetingLocationChange(e.target.value); showOnMap(e.target.value, marker1.current) }}
            placeholder="e.g. Home address, landmark"
            className="w-full bg-card border border-input rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Destination</label>
        <div className="relative">
          <Navigation className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
          <input
            value={destination}
            onChange={(e) => { onDestinationChange(e.target.value); showOnMap(e.target.value, marker2.current) }}
            placeholder="e.g. Hospital, office address"
            className="w-full bg-card border border-input rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div className="relative">
        <div ref={mapRef} className="w-full h-64 rounded-2xl border border-border overflow-hidden z-0" />
        {!mapReady && (
          <div className="absolute inset-0 bg-muted rounded-2xl flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading map...
          </div>
        )}
        <button
          onClick={getCurrentLocation}
          disabled={geoLoading}
          className="absolute top-3 right-3 z-[1000] bg-card border border-border p-2 rounded-xl shadow-lg hover:bg-muted transition-colors"
          title="Use my location"
        >
          {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Click on the map to set locations · Drag markers to adjust · Use geolocation button for current position
      </p>
    </div>
  )
}

async function reverseGeocode(lat: number, lng: number, callback: (addr: string) => void) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`, {
      headers: { 'User-Agent': 'WITHH/1.0' },
    })
    if (res.ok) {
      const data = await res.json()
      callback(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    }
  } catch {}
}
