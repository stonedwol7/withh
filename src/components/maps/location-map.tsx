'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' as const }],
}

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { 'User-Agent': 'WITHH/1.0' } }
    )
    const data = await res.json()
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
  } catch { /* ignore */ }
  return null
}

interface Props {
  location: string
  height?: string
  interactive?: boolean
}

export default function LocationMap({ location, height = '200px', interactive = false }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!location) { setLoading(false); return }
    geocode(location).then((c) => {
      setCoords(c)
      setLoading(false)
    })
  }, [location])

  useEffect(() => {
    if (!container.current || !coords) return

    const map = new maplibregl.Map({
      container: container.current,
      style: OSM_STYLE,
      center: [coords.lng, coords.lat],
      zoom: 15,
      interactive,
      attributionControl: false,
    })

    map.on('load', () => {
      new maplibregl.Marker({ color: '#0D1B3D' })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [coords, interactive])

  if (!location) return null

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center z-10">
          <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      )}
      {!loading && !coords && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
          <p className="text-xs text-muted-foreground/60">Could not locate: {location}</p>
        </div>
      )}
      <div ref={container} className="w-full h-full" />
    </div>
  )
}
