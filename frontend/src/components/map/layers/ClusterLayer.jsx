import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { COLORS } from "../constants";

export default function ClusterLayer({ geojson, onSelect }) {
  const map = useMap();

  useEffect(() => {
    if (!geojson) return;

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      disableClusteringAtZoom: 14, // fixes the "last level unclickable" bug from before
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="
            background: rgba(234, 88, 12, 0.85);
            color: #fff;
            border: 2px solid #fff;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: monospace;
            font-size: 12px;
            font-weight: bold;
          ">${count}</div>`,
          className: "",
          iconSize: [36, 36],
        });
      },
    });

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
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);
    return () => map.removeLayer(clusterGroup);
  }, [map, geojson, onSelect]);

  return null;
}
