'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapPin, Navigation, Crosshair, Loader2 } from 'lucide-react'

interface LocationPickerProps {
  meetingLocation: string
  destination: string
  onMeetingLocationChange: (val: string) => void
  onDestinationChange: (val: string) => void
}

interface SearchResult {
  display_name: string
  lat: string
  lon: string
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

  const [meetingResults, setMeetingResults] = useState<SearchResult[]>([])
  const [destinationResults, setDestinationResults] = useState<SearchResult[]>([])
  const [searchingMeeting, setSearchingMeeting] = useState(false)
  const [searchingDestination, setSearchingDestination] = useState(false)
  const [focusedInput, setFocusedInput] = useState<'meeting' | 'destination' | null>(null)

  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

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

  const tryParseCoords = (val: string): [number, number] | null => {
    const parts = val.split(',').map(s => parseFloat(s.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[0], parts[1]]
    }
    return null
  }

  const searchLocation = useCallback(async (query: string, setResults: (r: SearchResult[]) => void, setSearching: (v: boolean) => void) => {
    if (!query.trim() || query.trim().length < 3) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&countrycodes=in&limit=5&addressdetails=1`,
        { headers: { 'User-Agent': 'WITHH/1.0' } }
      )
      if (res.ok) {
        const data = await res.json()
        setResults(data || [])
      }
    } catch {}
    setSearching(false)
  }, [])

  const handleInputChange = (
    value: string,
    setValue: (v: string) => void,
    setResults: (r: SearchResult[]) => void,
    setSearching: (v: boolean) => void
  ) => {
    setValue(value)
    const coords = tryParseCoords(value)
    if (coords) {
      marker1.current?.setLatLng(coords)
      mapInstance.current?.setView(coords, 15)
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    if (value.trim().length >= 3 && !coords) {
      debounceTimer.current = setTimeout(() => {
        searchLocation(value, setResults, setSearching)
      }, 600)
    } else {
      setResults([])
    }
  }

  const selectResult = (result: SearchResult, marker: any, setValue: (v: string) => void, setResults: (r: SearchResult[]) => void) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    marker?.setLatLng([lat, lng])
    mapInstance.current?.setView([lat, lng], 15)
    setValue(result.display_name)
    setResults([])
  }

  return (
    <div className="space-y-5">
      <div className="relative">
        <label className="text-sm font-medium text-foreground mb-1.5 block">Meeting Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
          <input
            value={meetingLocation}
            onChange={(e) => handleInputChange(e.target.value, onMeetingLocationChange, setMeetingResults, setSearchingMeeting)}
            onFocus={() => setFocusedInput('meeting')}
            onBlur={() => setTimeout(() => setFocusedInput(null), 200)}
            placeholder="e.g. Home address, landmark, pincode"
            className="w-full bg-card border border-input rounded-xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-colors"
          />
          {searchingMeeting && (
            <Loader2 className="absolute right-3 top-3.5 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {meetingResults.length > 0 && focusedInput === 'meeting' && (
          <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto">
            {meetingResults.map((r, i) => (
              <button
                key={i}
                onMouseDown={() => selectResult(r, marker1.current, onMeetingLocationChange, setMeetingResults)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors border-b border-border last:border-0"
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <label className="text-sm font-medium text-foreground mb-1.5 block">Destination</label>
        <div className="relative">
          <Navigation className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
          <input
            value={destination}
            onChange={(e) => handleInputChange(e.target.value, onDestinationChange, setDestinationResults, setSearchingDestination)}
            onFocus={() => setFocusedInput('destination')}
            onBlur={() => setTimeout(() => setFocusedInput(null), 200)}
            placeholder="e.g. Hospital, office address, pincode"
            className="w-full bg-card border border-input rounded-xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-colors"
          />
          {searchingDestination && (
            <Loader2 className="absolute right-3 top-3.5 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {destinationResults.length > 0 && focusedInput === 'destination' && (
          <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto">
            {destinationResults.map((r, i) => (
              <button
                key={i}
                onMouseDown={() => selectResult(r, marker2.current, onDestinationChange, setDestinationResults)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors border-b border-border last:border-0"
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
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
        Type an address or pincode to search · Click map to set locations · Drag markers to adjust
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
