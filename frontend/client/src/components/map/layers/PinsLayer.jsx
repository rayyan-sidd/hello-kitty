import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { COLORS } from "../constants";

export default function PinsLayer({ geojson, onSelect }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson) return;
    const layerGroup = L.layerGroup();
    geojson.features.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const color = COLORS[feature.properties.classification] || "#999";
      const marker = L.circleMarker([lat, lng], {
        radius: 6,
        fillColor: color,
        fillOpacity: 0.9,
        color: "#fff",
        weight: 1,
      });
      marker.on("click", () => onSelect(feature));
      layerGroup.addLayer(marker);
    });
    map.addLayer(layerGroup);
    return () => map.removeLayer(layerGroup);
  }, [map, geojson, onSelect]);
  return null;
}
