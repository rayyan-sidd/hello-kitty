export default function SelectedSignalPanel({ feature, onClose }) {
  if (!feature) return null;
  const p = feature.properties;

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 1000,
        background: "#1a1005",
        border: "1px solid #ea580c",
        borderRadius: 6,
        padding: 16,
        color: "#fff",
        fontFamily: "monospace",
        fontSize: 13,
        minWidth: 240,
        maxWidth: 300,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        x
      </button>
      <div style={{ color: "#ea580c", fontWeight: "bold", marginBottom: 8 }}>
        {p.classification}
      </div>
      <div>Confidence: {(p.confidence_score * 100).toFixed(0)}%</div>
      <div>Persistence: {p.persist_days} days</div>
      <div>Detections: {p.detection_count}</div>
      {p.nearest_industrial_name && p.nearest_industrial_name !== "NaN" && (
        <div>Near: {p.nearest_industrial_name}</div>
      )}
      <div style={{ marginTop: 6, fontSize: 11, opacity: 0.7 }}>
        {p.first_detected} → {p.last_detected}
      </div>
    </div>
  );
}
