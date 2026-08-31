import { useEffect, useState } from "react";

export type DashboardSummary = {
  total: number;
  high_confidence: number;
  avg_confidence: number;
  latest_detected: string | null;
  by_type: Record<
    string,
    {
      count: number;
      avg_confidence: number;
      avg_persist_days: number;
    }
  >;
};

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export function useDashboardSummary(startDate?: string, endDate?: string) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestedParams = new URLSearchParams();
    if (startDate) requestedParams.set("start_date", startDate);
    if (endDate) requestedParams.set("end_date", endDate);

    const loadSummary = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/summary?${requestedParams.toString()}`
        );
        if (!response.ok)
          throw new Error(`Summary request failed: ${response.status}`);
        const data = (await response.json()) as DashboardSummary;

        // The preview archive includes dates that may not exist in the live table.
        // Fall back to the full database summary instead of displaying a false zero.
        if (data.total === 0 && requestedParams.toString()) {
          const fallbackResponse = await fetch(`${API_BASE}/summary`);
          if (!fallbackResponse.ok)
            throw new Error(
              `Summary fallback failed: ${fallbackResponse.status}`
            );
          return (await fallbackResponse.json()) as DashboardSummary;
        }
        return data;
      } catch (error) {
        console.warn(
          "Live dashboard summary unavailable; using preview values.",
          error
        );
        return null;
      }
    };

    setLoading(true);
    loadSummary()
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  return { summary, loading };
}
