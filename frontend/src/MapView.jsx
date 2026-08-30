// import { useEffect, useState, useRef } from "react";
// import { MapContainer, TileLayer, useMap } from "react-leaflet";
// import L from "leaflet";
// import "leaflet.heat";

// const DARK_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
// const DARK_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ';

// function HeatLayer({ points }) {
//   const map = useMap();

//   useEffect(() => {
//     if (!points || points.length === 0) return;

//     // points: [[lat, lng, intensity], ...]
//     const heatLayer = L.heatLayer(points, {
//       radius: 20,
//       blur: 25,
//       maxZoom: 10,
//       gradient: {
//         0.2: "#1e3a5f",
//         0.4: "#3b82f6",
//         0.6: "#eab308",
//         0.8: "#ea580c",
//         1.0: "#dc2626",
//       },
//     });

//     heatLayer.addTo(map);

//     return () => {
//       map.removeLayer(heatLayer);
//     };
//   }, [map, points]);

//   return null;
// }

// function DateRangeBar({ startDate, endDate, onChange }) {
//   return (
//     <div
//       style={{
//         position: "absolute",
//         bottom: 20,
//         left: "50%",
//         transform: "translateX(-50%)",
//         zIndex: 1000,
//         background: "#0a0e1a",
//         border: "1px solid #ea580c",
//         padding: "10px 16px",
//         borderRadius: 6,
//         display: "flex",
//         gap: 12,
//         alignItems: "center",
//         fontFamily: "monospace",
//         color: "#fff",
//         fontSize: 13,
//       }}
//     >
//       <label>
//         FROM:
//         <input
//           type="date"
//           value={startDate}
//           min="2026-05-01"
//           max="2026-08-29"
//           onChange={(e) => onChange(e.target.value, endDate)}
//           style={{
//             background: "#0a0e1a",
//             color: "#fff",
//             border: "1px solid #333",
//             marginLeft: 6,
//             padding: 2,
//           }}
//         />
//       </label>
//       <label>
//         TO:
//         <input
//           type="date"
//           value={endDate}
//           min="2026-05-01"
//           max="2026-08-29"
//           onChange={(e) => onChange(startDate, e.target.value)}
//           style={{
//             background: "#0a0e1a",
//             color: "#fff",
//             border: "1px solid #333",
//             marginLeft: 6,
//             padding: 2,
//           }}
//         />
//       </label>
//     </div>
//   );
// }

// export default function MapView() {
//   const [startDate, setStartDate] = useState("2026-08-25");
//   const [endDate, setEndDate] = useState("2026-08-27");
//   const [geojson, setGeojson] = useState(null);
//   const [heatPoints, setHeatPoints] = useState(null);

//   useEffect(() => {
//     const params = new URLSearchParams({
//       limit: 20000,
//       start_date: startDate,
//       end_date: endDate,
//     });

//     fetch(`http://localhost:8000/sites?${params}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setGeojson(data);
//         const heat = data.features.map((f) => [
//           f.geometry.coordinates[1],
//           f.geometry.coordinates[0],
//           f.properties.confidence_score || 0.5,
//         ]);
//         setHeatPoints(heat);
//       })
//       .catch((err) => console.error("Failed to load sites:", err));
//   }, [startDate, endDate]);

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100vw",
//         height: "100vh",
//         background: "#0a0e1a",
//       }}
//     >
//       <MapContainer
//         center={[22.5, 80]}
//         zoom={4.2}
//         style={{ width: "100%", height: "100%", background: "#0a0e1a" }}
//         zoomControl={false}
//       >
//         <TileLayer url={DARK_TILES} attribution={DARK_ATTRIBUTION} />
//         {heatPoints && <HeatLayer points={heatPoints} />}
//       </MapContainer>
//       <DateRangeBar
//         startDate={startDate}
//         endDate={endDate}
//         onChange={(s, e) => {
//           setStartDate(s);
//           setEndDate(e);
//         }}
//       />
//     </div>
//   );
// }
