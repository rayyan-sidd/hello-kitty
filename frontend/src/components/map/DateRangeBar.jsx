export default function DateRangeBar({ startDate, endDate, onChange }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        background: "#1a1005",
        border: "1px solid #ea580c",
        padding: "10px 16px",
        borderRadius: 6,
        display: "flex",
        gap: 12,
        alignItems: "center",
        fontFamily: "monospace",
        color: "#fff",
        fontSize: 13,
      }}
    >
      <label>
        FROM:
        <input
          type="date"
          value={startDate}
          min="2026-05-01"
          max="2026-08-29"
          onChange={(e) => onChange(e.target.value, endDate)}
          style={{
            background: "#1a1005",
            color: "#fff",
            border: "1px solid #333",
            marginLeft: 6,
            padding: 2,
          }}
        />
      </label>
      <label>
        TO:
        <input
          type="date"
          value={endDate}
          min="2026-05-01"
          max="2026-08-29"
          onChange={(e) => onChange(startDate, e.target.value)}
          style={{
            background: "#1a1005",
            color: "#fff",
            border: "1px solid #333",
            marginLeft: 6,
            padding: 2,
          }}
        />
      </label>
    </div>
  );
}
