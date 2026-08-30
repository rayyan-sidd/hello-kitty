import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import HeatLayer from "./layers/HeatLayer";
import ClusterLayer from "./layers/ClusterLayer";
import PinsLayer from "./layers/PinsLayer";
import MapModeSwitcher from "./MapModeSwitcher";
import DateRangeBar from "./DateRangeBar";
import { useSitesData } from "./useSitesData";

const DARK_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const DARK_ATTRIBUTION = "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ";

export default function MapView() {
  const [startDate, setStartDate] = useState("2026-05-01");
  const [endDate, setEndDate] = useState("2026-08-29");
  const [mapMode, setMapMode] = useState("clusters");
  const [selected, setSelected] = useState(null);
  const { geojson, heatPoints } = useSitesData(startDate, endDate);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#0a0e1a",
      }}
    >
      <MapContainer
        center={[22.5, 80]}
        zoom={4.2}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer url={DARK_TILES} attribution={DARK_ATTRIBUTION} />
        {mapMode === "heatmap" && heatPoints && (
          <HeatLayer points={heatPoints} />
        )}
        {mapMode === "clusters" && geojson && (
          <ClusterLayer geojson={geojson} onSelect={setSelected} />
        )}
        {mapMode === "pins" && geojson && (
          <PinsLayer geojson={geojson} onSelect={setSelected} />
        )}
      </MapContainer>
      <MapModeSwitcher mode={mapMode} onChange={setMapMode} />
      <DateRangeBar
        startDate={startDate}
        endDate={endDate}
        onChange={(s, e) => {
          setStartDate(s);
          setEndDate(e);
        }}
      />
    </div>
  );
}
