import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { COLORS } from "../constants";

// Heatmap pixels are a raster and cannot carry feature click events.
// These transparent hit targets preserve heatmap visuals while making each
// backend detection selectable.
export default function InteractiveSitesLayer({ geojson, onSelect }) {
  const map = useMap();

  useEffect(() => {
    if (!geojson?.features?.length) return;

    const hitLayer = L.layerGroup();
    geojson.features.forEach(feature => {
      const [lng, lat] = feature.geometry.coordinates;
      const color = COLORS[feature.properties.classification] || "#ffd25a";
      const marker = L.circleMarker([lat, lng], {
        radius: 10,
        stroke: false,
        fillColor: color,
        fillOpacity: 0.01,
        interactive: true,
        bubblingMouseEvents: false,
      });
      marker.on("click", event => {
        L.DomEvent.stopPropagation(event);
        onSelect?.(feature);
      });
      hitLayer.addLayer(marker);
    });

    hitLayer.addTo(map);
    return () => map.removeLayer(hitLayer);
  }, [map, geojson, onSelect]);

  return null;
}
