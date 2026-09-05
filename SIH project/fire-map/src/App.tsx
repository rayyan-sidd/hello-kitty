import { useEffect, useMemo, useRef, useState } from 'react'
import type { ExpressionSpecification, StyleSpecification } from 'maplibre-gl'
import { Map as MapLibreMap, NavigationControl, Popup, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import rawHotspots from './hotspots.json'

setWorkerUrl(workerUrl)

interface HotspotProperties {
  type: string
  confidence: number
}

interface HotspotFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: HotspotProperties
}

interface HotspotFeatureCollection {
  type: 'FeatureCollection'
  features: HotspotFeature[]
}

const hotspotsData = rawHotspots as unknown as HotspotFeatureCollection

type SeverityLevel = 'critical' | 'high' | 'moderate'

interface SeverityMeta {
  label: string
  level: SeverityLevel
  color: string
}

function getSeverityMeta(confidence: number): SeverityMeta {
  if (confidence >= 90) {
    return {
      label: 'Critical',
      level: 'critical',
      color: '#dc2626',
    }
  }
  if (confidence >= 80) {
    return {
      label: 'High',
      level: 'high',
      color: '#ea580c',
    }
  }
  return {
    label: 'Moderate',
    level: 'moderate',
    color: '#ca8a04',
  }
}

const lightMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    'carto-light': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
    },
  },
  layers: [
    {
      id: 'carto-light-layer',
      type: 'raster',
      source: 'carto-light',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
}

function createPopupHTML(
  type: string,
  confidence: number,
  coordinates: [number, number],
): string {
  const sev = getSeverityMeta(confidence)
  return `
    <div class="gis-popup">
      <div class="gis-popup-header">
        <span class="gis-popup-tag gis-tag-${sev.level}">
          <span class="gis-dot" style="background:${sev.color}"></span>
          ${sev.label} &bull; ${confidence}%
        </span>
      </div>
      <h3 class="gis-popup-title">${type}</h3>
      <div class="gis-popup-details">
        <div class="gis-popup-row">
          <span class="gis-popup-label">Coordinates</span>
          <span class="gis-popup-val">${coordinates[1].toFixed(4)}° N, ${coordinates[0].toFixed(4)}° E</span>
        </div>
        <div class="gis-popup-row">
          <span class="gis-popup-label">Data Source</span>
          <span class="gis-popup-val">hotspots.json</span>
        </div>
      </div>
    </div>
  `
}

function App() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<MapLibreMap | null>(null)
  const activePopupRef = useRef<Popup | null>(null)
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotFeature | null>(null)
  const [filterLevel, setFilterLevel] = useState<'all' | SeverityLevel>('all')

  const totalCount = hotspotsData.features.length

  const filteredFeatures = useMemo(() => {
    if (filterLevel === 'all') return hotspotsData.features
    return hotspotsData.features.filter(
      (feat) => getSeverityMeta(feat.properties.confidence).level === filterLevel,
    )
  }, [filterLevel])

  useEffect(() => {
    if (!mapContainer.current) return

    let pulseInterval: number | undefined

    const map = new MapLibreMap({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [79.2, 21.0],
      zoom: 4.6,
      minZoom: 3.5,
      maxZoom: 14,
      renderWorldCopies: false,
      attributionControl: false,
    })

    mapInstanceRef.current = map

    map.addControl(
      new NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: false,
      }),
      'top-right',
    )

    map.on('load', () => {
      map.addSource('hotspots', {
        type: 'geojson',
        data: hotspotsData,
      })

      const confidenceColor: ExpressionSpecification = [
        'step',
        ['to-number', ['get', 'confidence']],
        '#ca8a04', // <80: yellow / moderate
        80,
        '#ea580c', // 80-89: orange / high
        90,
        '#dc2626', // >=90: red / critical
      ]

      // Subtle Outer Pulsing Ring
      map.addLayer({
        id: 'hotspot-pulse',
        type: 'circle',
        source: 'hotspots',
        paint: {
          'circle-radius': 10,
          'circle-color': confidenceColor,
          'circle-opacity': 0.25,
          'circle-pitch-alignment': 'map',
        },
      })

      // Sharp Core Marker
      map.addLayer({
        id: 'hotspot-points',
        type: 'circle',
        source: 'hotspots',
        paint: {
          'circle-radius': 6.5,
          'circle-color': confidenceColor,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
        },
      })

      // Smooth subtle pulse transitions
      map.setPaintProperty('hotspot-pulse', 'circle-radius-transition', {
        duration: 1100,
        delay: 0,
      })

      map.setPaintProperty('hotspot-pulse', 'circle-opacity-transition', {
        duration: 1100,
        delay: 0,
      })

      let isExpanded = false
      pulseInterval = window.setInterval(() => {
        isExpanded = !isExpanded

        map.setPaintProperty(
          'hotspot-pulse',
          'circle-radius',
          isExpanded ? 18 : 10,
        )

        map.setPaintProperty(
          'hotspot-pulse',
          'circle-opacity',
          isExpanded ? 0.04 : 0.25,
        )
      }, 1100)

      map.on('click', 'hotspot-points', (event) => {
        const feature = event.features?.[0]
        if (!feature || feature.geometry.type !== 'Point') return

        const [lng, lat] = feature.geometry.coordinates as [number, number]
        const props = feature.properties as HotspotProperties

        const matched = hotspotsData.features.find(
          (f) =>
            f.geometry.coordinates[0] === lng &&
            f.geometry.coordinates[1] === lat,
        )
        setSelectedHotspot(matched ?? null)

        if (activePopupRef.current) {
          activePopupRef.current.remove()
        }

        const popup = new Popup({
          closeButton: true,
          closeOnClick: false,
          className: 'gis-map-popup',
          offset: 10,
        })
          .setLngLat([lng, lat])
          .setHTML(createPopupHTML(props.type, props.confidence, [lng, lat]))
          .addTo(map)

        popup.on('close', () => {
          activePopupRef.current = null
        })

        activePopupRef.current = popup
      })

      map.on('mouseenter', 'hotspot-points', () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mouseleave', 'hotspot-points', () => {
        map.getCanvas().style.cursor = ''
      })
    })

    return () => {
      if (pulseInterval !== undefined) {
        window.clearInterval(pulseInterval)
      }
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Sync map layer filter when filterLevel changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !map.isStyleLoaded()) return

    if (!map.getLayer('hotspot-points') || !map.getLayer('hotspot-pulse')) return

    let filterExpression: any = null

    if (filterLevel === 'critical') {
      filterExpression = ['>=', ['to-number', ['get', 'confidence']], 90]
    } else if (filterLevel === 'high') {
      filterExpression = [
        'all',
        ['>=', ['to-number', ['get', 'confidence']], 80],
        ['<', ['to-number', ['get', 'confidence']], 90],
      ]
    } else if (filterLevel === 'moderate') {
      filterExpression = ['<', ['to-number', ['get', 'confidence']], 80]
    }

    map.setFilter('hotspot-points', filterExpression)
    map.setFilter('hotspot-pulse', filterExpression)
  }, [filterLevel])

  const handleResetView = () => {
    if (!mapInstanceRef.current) return
    setSelectedHotspot(null)
    if (activePopupRef.current) {
      activePopupRef.current.remove()
      activePopupRef.current = null
    }
    mapInstanceRef.current.flyTo({
      center: [79.2, 21.0],
      zoom: 4.6,
      duration: 800,
    })
  }

  const handleSelectHotspot = (feature: HotspotFeature) => {
    if (!mapInstanceRef.current) return
    setSelectedHotspot(feature)
    const [lng, lat] = feature.geometry.coordinates

    mapInstanceRef.current.flyTo({
      center: [lng, lat],
      zoom: 7,
      duration: 900,
    })

    if (activePopupRef.current) {
      activePopupRef.current.remove()
    }

    const popup = new Popup({
      closeButton: true,
      closeOnClick: false,
      className: 'gis-map-popup',
      offset: 10,
    })
      .setLngLat([lng, lat])
      .setHTML(
        createPopupHTML(
          feature.properties.type,
          feature.properties.confidence,
          [lng, lat],
        ),
      )
      .addTo(mapInstanceRef.current)

    popup.on('close', () => {
      activePopupRef.current = null
    })

    activePopupRef.current = popup
  }

  return (
    <div className="gis-app">
      {/* Clean Top Header */}
      <header className="gis-header">
        <div className="gis-header-left">
          <h1 className="gis-title">Thermal Hotspot Monitor</h1>
          <span className="gis-count-badge">
            {totalCount} hotspot{totalCount === 1 ? '' : 's'} recorded
          </span>
        </div>

        <div className="gis-header-right">
          <button
            type="button"
            className="gis-btn-secondary"
            onClick={handleResetView}
          >
            Refocus India
          </button>
        </div>
      </header>

      {/* Map Main Area */}
      <main className="gis-main">
        <div ref={mapContainer} className="gis-map" />

        {/* Compact Legend & Filter Card */}
        <div className="gis-legend-card">
          <div className="gis-legend-header">
            <span className="gis-legend-title">Confidence Severity</span>
          </div>

          <div className="gis-legend-items">
            <button
              type="button"
              className={`gis-legend-item ${filterLevel === 'all' ? 'is-active' : ''}`}
              onClick={() => setFilterLevel('all')}
            >
              <span className="gis-legend-dot dot-all" />
              <span className="gis-legend-label">All Hotspots</span>
              <span className="gis-legend-val">{totalCount}</span>
            </button>

            <button
              type="button"
              className={`gis-legend-item ${filterLevel === 'critical' ? 'is-active' : ''}`}
              onClick={() => setFilterLevel(filterLevel === 'critical' ? 'all' : 'critical')}
            >
              <span className="gis-legend-dot dot-critical" />
              <span className="gis-legend-label">Critical (&ge;90%)</span>
              <span className="gis-legend-val">
                {hotspotsData.features.filter((f) => f.properties.confidence >= 90).length}
              </span>
            </button>

            <button
              type="button"
              className={`gis-legend-item ${filterLevel === 'high' ? 'is-active' : ''}`}
              onClick={() => setFilterLevel(filterLevel === 'high' ? 'all' : 'high')}
            >
              <span className="gis-legend-dot dot-high" />
              <span className="gis-legend-label">High (80&ndash;89%)</span>
              <span className="gis-legend-val">
                {
                  hotspotsData.features.filter(
                    (f) => f.properties.confidence >= 80 && f.properties.confidence < 90,
                  ).length
                }
              </span>
            </button>

            <button
              type="button"
              className={`gis-legend-item ${filterLevel === 'moderate' ? 'is-active' : ''}`}
              onClick={() => setFilterLevel(filterLevel === 'moderate' ? 'all' : 'moderate')}
            >
              <span className="gis-legend-dot dot-moderate" />
              <span className="gis-legend-label">Moderate (&lt;80%)</span>
              <span className="gis-legend-val">
                {hotspotsData.features.filter((f) => f.properties.confidence < 80).length}
              </span>
            </button>
          </div>

          {/* Quick Marker List */}
          <div className="gis-marker-list">
            <div className="gis-marker-list-title">Hotspot Records</div>
            {filteredFeatures.map((feat) => {
              const sev = getSeverityMeta(feat.properties.confidence)
              const isCurrent =
                selectedHotspot?.geometry.coordinates[0] === feat.geometry.coordinates[0] &&
                selectedHotspot?.geometry.coordinates[1] === feat.geometry.coordinates[1]

              return (
                <button
                  key={`${feat.geometry.coordinates[0]}-${feat.geometry.coordinates[1]}`}
                  type="button"
                  className={`gis-marker-row ${isCurrent ? 'is-selected' : ''}`}
                  onClick={() => handleSelectHotspot(feat)}
                >
                  <span
                    className="gis-row-indicator"
                    style={{ backgroundColor: sev.color }}
                  />
                  <div className="gis-row-info">
                    <span className="gis-row-name">{feat.properties.type}</span>
                    <span className="gis-row-coords">
                      {feat.geometry.coordinates[1].toFixed(2)}°N, {feat.geometry.coordinates[0].toFixed(2)}°E
                    </span>
                  </div>
                  <span className="gis-row-conf">{feat.properties.confidence}%</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Minimal Footer Attribution */}
        <footer className="gis-footer">
          <span>MapLibre GL &bull; Basemap &copy; OpenStreetMap contributors, CARTO</span>
        </footer>
      </main>
    </div>
  )
}

export default App