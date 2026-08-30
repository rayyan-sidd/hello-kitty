import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

export default function HeatLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    const heatLayer = L.heatLayer(points, {
      radius: 20,
      blur: 25,
      maxZoom: 10,
      gradient: {
        0.2: "#1e3a5f",
        0.4: "#3b82f6",
        0.6: "#eab308",
        0.8: "#ea580c",
        1.0: "#dc2626",
      },
    });
    heatLayer.addTo(map);
    return () => map.removeLayer(heatLayer);
  }, [map, points]);
  return null;
}
