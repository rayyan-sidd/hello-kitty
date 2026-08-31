import { useEffect, useState } from "react";

export type AnalyticsData = {
  total: number;
  avg_confidence: number;
  classification: Array<{ label: string; count: number }>;
  confidence_distribution: Array<{ label: string; count: number }>;
  intensity_distribution: Array<{ label: string; count: number }>;
  top_locations: Array<{ label: string; group?: string; count: number }>;
};

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export function useAnalyticsData(startDate?: string, endDate?: string) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);

    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/analytics?${params.toString()}`)
      .then(response => {
        if (!response.ok)
          throw new Error(`Analytics request failed: ${response.status}`);
        return response.json();
      })
      .then((payload: AnalyticsData) => setData(payload))
      .catch((reason: Error) => {
        setData(null);
        setError(reason.message);
      })
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  return { data, loading, error };
}
