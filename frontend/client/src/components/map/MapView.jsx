import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import HeatLayer from "./layers/HeatLayer";
import ClusterLayer from "./layers/ClusterLayer";
import PinsLayer from "./layers/PinsLayer";
import { useSitesData } from "./useSitesData";

const DARK_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const DARK_ATTRIBUTION = "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ";

function ResizeFix() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    resizeObserver.observe(container);

    // also do an initial pass in case it's already correctly sized
    map.invalidateSize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [map]);

  return null;
}

export default function MapView({ startDate, endDate, mapMode, onSelect }) {
  const { geojson, heatPoints } = useSitesData(startDate, endDate);
  // const { geojson, heatPoints } = useSitesData(startDate, endDate);
  console.log("MapView geojson:", geojson);
  console.log("MapView mapMode:", mapMode);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
      <MapContainer
        center={[22.5, 80]}
        zoom={4.2}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer url={DARK_TILES} attribution={DARK_ATTRIBUTION} />
        <ResizeFix />
        {mapMode === "heatmap" && heatPoints && (
          <HeatLayer points={heatPoints} />
        )}
        {mapMode === "clusters" && geojson && (
          <ClusterLayer geojson={geojson} onSelect={onSelect} />
        )}
        {mapMode === "pins" && geojson && (
          <PinsLayer geojson={geojson} onSelect={onSelect} />
        )}
      </MapContainer>
    </div>
  );
}
