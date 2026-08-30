import { useState, useEffect } from "react";

export function useSitesData(startDate, endDate) {
  const [geojson, setGeojson] = useState(null);
  const [heatPoints, setHeatPoints] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams({
      limit: 20000,
      start_date: startDate,
      end_date: endDate,
    });
    fetch(`http://localhost:8000/sites?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setGeojson(data);
        setHeatPoints(
          data.features.map((f) => [
            f.geometry.coordinates[1],
            f.geometry.coordinates[0],
            f.properties.confidence_score || 0.5,
          ]),
        );
      })
      .catch((err) => console.error("Failed to load sites:", err));
  }, [startDate, endDate]);

  return { geojson, heatPoints };
}
